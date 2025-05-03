import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { makeEmergencyCall } from "@/lib/voice";

// More flexible input validation schema for Raspberry Pi data
// This handles multiple possible formats that the device might send
const alertSchema = z.object({
  // Accept either device_id or deviceId
  device_id: z.string().min(1, "Device ID is required").optional(),
  deviceId: z.string().min(1, "Device ID is required").optional(),
  
  // Accept timestamp in various formats
  timestamp: z.string().or(z.date()).transform(val => new Date(val)).optional(),
  
  // Accept either prediction or alert_type
  prediction: z.number().int().optional(),
  alert_type: z.string().optional(),
  
  // Optional additional data fields
  confidence: z.number().optional(),
  type: z.enum(["prediction", "onset"]).optional(),
}).refine(data => data.device_id || data.deviceId, {
  message: "Either device_id or deviceId must be provided",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received alert data:", JSON.stringify(body));
    
    // Validate the input data
    const validation = alertSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation error:", validation.error.errors);
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract data with fallbacks for different formats
    const validData = validation.data;
    const device_id = validData.device_id || validData.deviceId || "";
    const timestamp = validData.timestamp || new Date();
    
    // Determine if this is an alert based on various possible inputs
    let isAlert = false;
    let alertType = "prediction";
    let confidence = 0.85; // Default confidence
    
    if (validData.prediction === 1) {
      isAlert = true;
    } else if (validData.alert_type === "seizure" || validData.alert_type === "prediction") {
      isAlert = true;
    } else if (validData.type === "prediction" || validData.type === "onset") {
      isAlert = true;
      alertType = validData.type;
    }
    
    // Use provided confidence if available
    if (validData.confidence !== undefined) {
      confidence = validData.confidence;
    }

    console.log("Parsed data:", { device_id, timestamp, isAlert, alertType, confidence });

    // 1. Find the user associated with the device
    const user = await prisma.user.findUnique({
      where: { deviceId: device_id },
      include: {
        emergencyContacts: true,
      },
    });

    if (!user) {
      console.error(`Device ID not found: ${device_id}`);
      return NextResponse.json(
        { error: "Device ID not registered to any user" },
        { status: 404 }
      );
    }

    // Only proceed with alert if there's an alert condition
    if (!isAlert) {
      return NextResponse.json({
        success: true,
        message: "Data received, no alert needed",
      });
    }

    // 2. Create the alert record
    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        deviceId: device_id,
        timestamp,
        type: alertType, 
        confidence,
      },
    });

    console.log("Alert created:", alert.id);

    // 3. Send notifications based on priority
    // Find primary contact and other contacts
    const primaryContact = user.emergencyContacts.find(c => c.isPrimaryContact);
    const otherContacts = user.emergencyContacts.filter(c => !c.isPrimaryContact);
    
    // Track notification statuses
    const notificationStatuses = [];

    // Generate acknowledgment links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // Send to primary contact first if available
    if (primaryContact) {
      console.log(`Sending primary notification to ${primaryContact.name}`);
      const acknowledgeUrl = `${baseUrl}/alerts/${alert.id}/acknowledge?contact=${primaryContact.id}`;
      
      // Parse the contact's notification preferences
      const contactPrefs = typeof primaryContact.notificationPreferences === 'string'
        ? JSON.parse(primaryContact.notificationPreferences)
        : primaryContact.notificationPreferences || { email: true, sms: true, voice: true };
      
      // Send email notification if enabled in preferences
      if (contactPrefs.email) {
        const emailResult = await sendEmail({
          to: primaryContact.email,
          subject: `URGENT: Epilepsy Seizure ${alertType === "onset" ? "Onset" : "Prediction"} Alert`,
          text: `
A potential seizure has been ${alertType === "onset" ? "detected" : "predicted"} for ${user.name}.
Timestamp: ${timestamp.toLocaleString()}

Please check on them immediately and click the link below to acknowledge this alert:
${acknowledgeUrl}

This is a priority notification as you are listed as the primary emergency contact.
        `,
        });

        console.log(`Email sent to primary contact: ${primaryContact.email}`);

        // Record email notification attempt
        notificationStatuses.push({
          alertId: alert.id,
          contactId: primaryContact.id,
          type: "email",
          recipient: primaryContact.email,
          status: emailResult ? "success" : "failed",
          timestamp: new Date(),
          acknowledged: false,
        });
      }

      // Send SMS notification if enabled in preferences
      if (contactPrefs.sms) {
        const smsResult = await sendSMS({
          to: primaryContact.phone,
          message: `URGENT: Seizure ${alertType === "onset" ? "detected" : "predicted"} for ${user.name}. Please check immediately and acknowledge: ${acknowledgeUrl}`
        });

        // Record SMS notification attempt
        notificationStatuses.push({
          alertId: alert.id,
          contactId: primaryContact.id,
          type: "sms",
          recipient: primaryContact.phone,
          status: smsResult ? "success" : "failed",
          timestamp: new Date(),
          acknowledged: false,
        });
      }
      
      // Make voice call if enabled in preferences
      if (contactPrefs.voice) {
        const voiceResult = await makeEmergencyCall({
          to: primaryContact.phone,
          patientName: user.name,
          alertId: alert.id,
          contactId: primaryContact.id,
          acknowledgeUrl
        });
        
        // Record voice call attempt
        notificationStatuses.push({
          alertId: alert.id,
          contactId: primaryContact.id,
          type: "voice",
          recipient: primaryContact.phone,
          status: voiceResult ? "pending" : "failed", // Voice calls start as pending until completed
          timestamp: new Date(),
          acknowledged: false,
        });
      }
      
    } else {
      console.log("No primary contact found");
    }

    // Send to other contacts in parallel
    if (otherContacts.length > 0) {
      console.log(`Sending notifications to ${otherContacts.length} other contacts`);
      const otherNotifications = await Promise.all(
        otherContacts.map(async (contact) => {
          const acknowledgeUrl = `${baseUrl}/alerts/${alert.id}/acknowledge?contact=${contact.id}`;
          const notifications = [];
          
          // Parse the contact's notification preferences
          const contactPrefs = typeof contact.notificationPreferences === 'string'
            ? JSON.parse(contact.notificationPreferences)
            : contact.notificationPreferences || { email: true, sms: true, voice: true };
          
          // Send email notification if enabled in preferences
          if (contactPrefs.email) {
            const emailResult = await sendEmail({
              to: contact.email,
              subject: `Epilepsy Seizure ${alertType === "onset" ? "Onset" : "Prediction"} Alert`,
              text: `
A potential seizure has been ${alertType === "onset" ? "detected" : "predicted"} for ${user.name}.
Timestamp: ${timestamp.toLocaleString()}

Please check on them and click the link below to acknowledge this alert:
${acknowledgeUrl}
              `,
            });
            
            notifications.push({
              alertId: alert.id,
              contactId: contact.id,
              type: "email",
              recipient: contact.email,
              status: emailResult ? "success" : "failed",
              timestamp: new Date(),
              acknowledged: false,
            });
          }

          // Send SMS notification if enabled in preferences
          if (contactPrefs.sms) {
            const smsResult = await sendSMS({
              to: contact.phone,
              message: `Alert: Seizure ${alertType === "onset" ? "detected" : "predicted"} for ${user.name}. Please check and acknowledge: ${acknowledgeUrl}`
            });
            
            notifications.push({
              alertId: alert.id,
              contactId: contact.id,
              type: "sms",
              recipient: contact.phone,
              status: smsResult ? "success" : "failed",
              timestamp: new Date(),
              acknowledged: false,
            });
          }
          
          // Make voice call if enabled in preferences
          if (contactPrefs.voice) {
            // For secondary contacts, make voice calls after a short delay
            // This ensures primary contact gets notified first
            const voiceResult = await new Promise<boolean>(resolve => {
              setTimeout(async () => {
                const result = await makeEmergencyCall({
                  to: contact.phone,
                  patientName: user.name,
                  alertId: alert.id,
                  contactId: contact.id,
                  acknowledgeUrl
                });
                resolve(result);
              }, 30000); // 30-second delay for secondary contacts
            });
            
            notifications.push({
              alertId: alert.id,
              contactId: contact.id,
              type: "voice",
              recipient: contact.phone,
              status: voiceResult ? "pending" : "failed",
              timestamp: new Date(),
              acknowledged: false,
            });
          }

          return notifications;
        })
      );

      // Flatten the array of notification status arrays
      const flattenedOtherNotifications = otherNotifications.flat();
      notificationStatuses.push(...flattenedOtherNotifications);
    }
    
    // 4. Record all notification attempts in the database
    if (notificationStatuses.length > 0) {
      await prisma.notificationSent.createMany({
        data: notificationStatuses,
      });
      console.log(`Recorded ${notificationStatuses.length} notifications`);
      
      // Update the alert with the created notifications to ensure they show up in the UI
      const alertWithNotifications = await prisma.alert.findUnique({
        where: { id: alert.id },
        include: { notificationsSent: true }
      });
      
      console.log(`Alert now has ${alertWithNotifications?.notificationsSent.length || 0} notifications attached`);
    }

    return NextResponse.json({
      success: true,
      message: "Alert processed successfully",
      alertId: alert.id,
      notificationsSent: notificationStatuses.length,
    });
  } catch (error) {
    console.error("Error processing device alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}