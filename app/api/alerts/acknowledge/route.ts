import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Input validation schema
const acknowledgeSchema = z.object({
  alertId: z.string().min(1, "Alert ID is required"),
  contactId: z.string().min(1, "Contact ID is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received acknowledge request:", body);
    
    // Validate the input data
    const validation = acknowledgeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { alertId, contactId } = validation.data;

    // Verify the alert exists
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        user: {
          include: {
            emergencyContacts: true,
          },
        },
      },
    });

    if (!alert) {
      console.error(`Alert not found: ${alertId}`);
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    console.log(`Found alert: ${alertId}, checking contact...`);
    
    // Verify the contact is associated with the user who received the alert
    const isValidContact = alert.user.emergencyContacts.some(
      (contact) => contact.id === contactId
    );

    if (!isValidContact) {
      console.error(`Invalid contact: ${contactId} for alert: ${alertId}`);
      return NextResponse.json(
        { error: "Invalid contact for this alert" },
        { status: 403 }
      );
    }
    
    console.log(`Contact ${contactId} is valid for alert ${alertId}`);

    // Check if this is the first acknowledgment for this alert
    // Always directly check if firstAcknowledgedAt or firstAcknowledgedBy is null
    const currentAlert = await prisma.alert.findUnique({
      where: { id: alertId },
      select: { firstAcknowledgedBy: true, firstAcknowledgedAt: true },
    });
    
    console.log("Current alert acknowledgment status:", currentAlert);

    // Mark this as first acknowledgment if either field is null
    const isFirstAcknowledgment = !currentAlert?.firstAcknowledgedBy || !currentAlert?.firstAcknowledgedAt;
    console.log(`Is first acknowledgment: ${isFirstAcknowledgment}`);

    // First, let's make sure we update the alert record if this is the first acknowledgment
    // Do this BEFORE checking notifications to ensure it happens regardless
    if (isFirstAcknowledgment) {
      console.log(`Setting first acknowledgment for alert ${alertId} by contact ${contactId}`);
      await prisma.alert.update({
        where: { id: alertId },
        data: {
          firstAcknowledgedAt: new Date(),
          firstAcknowledgedBy: contactId,
        },
      });
      console.log("Alert updated with first acknowledgment information");
    }

    // Find notifications for this alert and contact that haven't been acknowledged yet
    const notifications = await prisma.notificationSent.findMany({
      where: {
        alertId,
        contactId,
        acknowledged: false,
      },
    });
    
    console.log(`Found ${notifications.length} unacknowledged notifications`);

    if (notifications.length === 0) {
      // Check if this contact has already acknowledged the alert
      const alreadyAcknowledged = await prisma.notificationSent.findFirst({
        where: {
          alertId,
          contactId,
          acknowledged: true,
        },
      });

      if (alreadyAcknowledged) {
        console.log("Alert was already acknowledged by this contact");
        return NextResponse.json({
          success: true,
          message: "Alert was already acknowledged by this contact",
          isFirstAcknowledgment: isFirstAcknowledgment
        });
      }

      // If no notifications exist for this contact but the contact is valid,
      // create a new notification record and mark it as acknowledged
      console.log("Creating new notification record for manual acknowledgment");
      const newNotification = await prisma.notificationSent.create({
        data: {
          alertId,
          contactId,
          type: "manual", // This indicates it was manually acknowledged without a prior notification
          recipient: "manual_acknowledgment",
          status: "success",
          timestamp: new Date(),
          acknowledged: true,
          acknowledgedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Alert acknowledged successfully (no prior notifications)",
        notification: newNotification,
        isFirstAcknowledgment: isFirstAcknowledgment
      });
    }

    // Update all notifications to acknowledged
    console.log("Updating existing notifications to acknowledged");
    await prisma.notificationSent.updateMany({
      where: {
        alertId,
        contactId,
        acknowledged: false,
      },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
    });

    // Get the updated notifications
    const updatedNotifications = await prisma.notificationSent.findMany({
      where: {
        alertId,
        contactId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Alert acknowledged successfully",
      notifications: updatedNotifications,
      isFirstAcknowledgment: isFirstAcknowledgment
    });
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}