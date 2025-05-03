import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { makeEmergencyCall } from "@/lib/voice";
import { z } from "zod";

// Schema for the request body
const testAlertSchema = z.object({
  notificationType: z.enum(['all', 'sms', 'email', 'voice']).default('all')
});

/**
 * This is a test endpoint for simulating device alerts from a Raspberry Pi.
 * It allows authenticated users to test the notification system.
 */
export async function POST(req: Request) {
  try {
    // Make sure the request is authenticated
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const validation = testAlertSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { notificationType } = validation.data;

    // Get the user making the request
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        emergencyContacts: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user has a device ID
    if (!user.deviceId) {
      return NextResponse.json(
        { error: "No device ID assigned to this user. Please set up your device first." },
        { status: 400 }
      );
    }

    // Check if the user has emergency contacts set up
    if (user.emergencyContacts.length === 0) {
      return NextResponse.json(
        { error: "No emergency contacts found. Please add contacts before testing alerts." },
        { status: 400 }
      );
    }

    try {
      // Create a test alert directly in the database
      const alert = await prisma.alert.create({
        data: {
          userId: user.id,
          deviceId: user.deviceId,
          timestamp: new Date(),
          type: "prediction",
          confidence: 0.85, // Default confidence level for prediction alerts
        },
      });
      
      console.log("Test alert created:", alert.id);
      
      // Find primary contact and other contacts
      const primaryContact = user.emergencyContacts.find(c => c.isPrimaryContact);
      const otherContacts = user.emergencyContacts.filter(c => !c.isPrimaryContact);
      
      // Track notification statuses
      const notificationStatuses = [];
      
      // Generate acknowledgment links
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      
      // Handle notifications based on selected type and contact preferences
      const shouldSendEmail = (notificationType === 'all' || notificationType === 'email');
      const shouldSendSMS = (notificationType === 'all' || notificationType === 'sms');
      const shouldMakeCall = (notificationType === 'all' || notificationType === 'voice');
      
      // Send to primary contact first if available
      if (primaryContact) {
        console.log(`Sending primary notification to ${primaryContact.name}`);
        const acknowledgeUrl = `${baseUrl}/alerts/${alert.id}/acknowledge?contact=${primaryContact.id}`;
        
        // Parse the contact's notification preferences
        const contactPrefs = typeof primaryContact.notificationPreferences === 'string'
          ? JSON.parse(primaryContact.notificationPreferences)
          : primaryContact.notificationPreferences || { email: true, sms: true, voice: true };
          
        // Send email if selected AND enabled in contact preferences
        if (shouldSendEmail && contactPrefs.email) {
          const emailResult = await sendEmail({
            to: primaryContact.email,
            subject: `TEST ALERT: Epilepsy Seizure Prediction`,
            text: `
This is a TEST alert. A potential seizure has been predicted for ${user.name}.
Timestamp: ${new Date().toLocaleString()}

Please click the link below to acknowledge this test alert:
${acknowledgeUrl}

This is a test of the notification system. No action is required.
            `,
          });
    
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
  
        // Send SMS if selected AND enabled in contact preferences
        if (shouldSendSMS && contactPrefs.sms) {
          const smsResult = await sendSMS({
            to: primaryContact.phone,
            message: `TEST ALERT: Seizure prediction for ${user.name}. This is a TEST of the alert system. Acknowledge at: ${acknowledgeUrl}`
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
        
        // Make voice call if selected AND enabled in contact preferences
        if (shouldMakeCall && contactPrefs.voice) {
          const voiceResult = await makeEmergencyCall({
            to: primaryContact.phone,
            patientName: user.name,
            alertId: alert.id, 
            contactId: primaryContact.id,
            acknowledgeUrl: acknowledgeUrl
          });
          
          // Record voice call attempt
          notificationStatuses.push({
            alertId: alert.id,
            contactId: primaryContact.id,
            type: "voice",
            recipient: primaryContact.phone,
            status: voiceResult ? "pending" : "failed", // Voice calls start as pending
            timestamp: new Date(),
            acknowledged: false,
          });
        }
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
            
            // Send email if selected AND enabled in contact preferences
            if (shouldSendEmail && contactPrefs.email) {
              const emailResult = await sendEmail({
                to: contact.email,
                subject: `TEST ALERT: Epilepsy Seizure Prediction`,
                text: `
This is a TEST alert. A potential seizure has been predicted for ${user.name}.
Timestamp: ${new Date().toLocaleString()}

Please click the link below to acknowledge this test alert:
${acknowledgeUrl}

This is a test of the notification system. No action is required.
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
  
            // Send SMS if selected AND enabled in contact preferences
            if (shouldSendSMS && contactPrefs.sms) {
              const smsResult = await sendSMS({
                to: contact.phone,
                message: `TEST ALERT: Seizure prediction for ${user.name}. This is a TEST of the alert system. Acknowledge at: ${acknowledgeUrl}`
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
            
            // Make voice call if selected AND enabled in contact preferences
            if (shouldMakeCall && contactPrefs.voice) {
              // For secondary contacts, make voice calls with a slight delay
              // to prevent multiple calls at once
              const voiceResult = await new Promise<boolean>(resolve => {
                setTimeout(async () => {
                  const result = await makeEmergencyCall({
                    to: contact.phone,
                    patientName: user.name,
                    alertId: alert.id,
                    contactId: contact.id,
                    acknowledgeUrl: acknowledgeUrl
                  });
                  resolve(result);
                }, 5000); // 5-second delay between calls
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
      
      // Record all notification attempts in the database
      if (notificationStatuses.length > 0) {
        await prisma.notificationSent.createMany({
          data: notificationStatuses,
        });
        console.log(`Recorded ${notificationStatuses.length} test notifications`);
      }
      
      // Determine message based on notification type
      let successMessage = '';
      if (notificationType === 'all') {
        successMessage = `Test alert sent successfully. Notifications sent to ${notificationStatuses.length/3} recipients via email, SMS, and voice call.`;
      } else if (notificationType === 'sms') {
        successMessage = `Test SMS alerts sent successfully to ${notificationStatuses.length} recipients.`;
      } else if (notificationType === 'email') {
        successMessage = `Test email alerts sent successfully to ${notificationStatuses.length} recipients.`;
      } else if (notificationType === 'voice') {
        successMessage = `Test voice calls initiated to ${notificationStatuses.length} recipients.`;
      }
      
      return NextResponse.json({
        success: true,
        message: successMessage,
        alertId: alert.id,
        deviceId: user.deviceId
      });
      
    } catch (error) {
      console.error("Error sending test alert:", error);
      return NextResponse.json(
        { 
          error: "Test alert processing failed", 
          details: error instanceof Error ? error.message : "Unknown error" 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test device alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}