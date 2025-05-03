import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Input validation schema
const contactUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number is required").optional(),
  relationship: z.string().min(1, "Relationship is required").optional(),
  isPrimaryContact: z.boolean().optional(),
  notificationPreferences: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    voice: z.boolean()
  }).optional(),
});

interface ContactRequest {
  params: {
    id: string;
  };
}

// Get a specific emergency contact
export async function GET(req: Request, { params }: ContactRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contactId = params.id;
    
    const contact = await prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Verify that the contact belongs to the authenticated user
    if (contact.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a specific emergency contact
export async function PUT(req: Request, { params }: ContactRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contactId = params.id;
    const body = await req.json();
    
    // Validate the input data
    const validation = contactUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Check if the contact exists and belongs to the user
    const existingContact = await prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (existingContact.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { isPrimaryContact, notificationPreferences, ...otherData } = validation.data;

    // If this contact will be primary, update any existing primary contact
    if (isPrimaryContact) {
      await prisma.emergencyContact.updateMany({
        where: { 
          userId,
          isPrimaryContact: true,
          id: { not: contactId }
        },
        data: { isPrimaryContact: false },
      });
    }

    // Create the full update data object with proper typing
    const updateData: Prisma.EmergencyContactUpdateInput = { ...otherData };
    
    if (isPrimaryContact !== undefined) {
      updateData.isPrimaryContact = isPrimaryContact;
    }
    
    if (notificationPreferences) {
      updateData.notificationPreferences = notificationPreferences;
    }
    
    // Update the contact with all data in a single operation
    const updatedContact = await prisma.emergencyContact.update({
      where: { id: contactId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Contact updated successfully",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a specific emergency contact
export async function DELETE(req: Request, { params }: ContactRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contactId = params.id;
    
    // Check if the contact exists and belongs to the user
    const existingContact = await prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (existingContact.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the contact
    await prisma.emergencyContact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}