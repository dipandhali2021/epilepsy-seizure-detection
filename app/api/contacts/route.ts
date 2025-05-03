import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Input validation schema
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  relationship: z.string().min(1, "Relationship is required"),
  isPrimaryContact: z.boolean().optional().default(false),
  notificationPreferences: z.object({
    email: z.boolean().default(false),
    sms: z.boolean().default(false),
    voice: z.boolean().default(false)
  }).optional()
});

// Get all emergency contacts for the authenticated user
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Explicitly select all fields including notificationPreferences
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { isPrimaryContact: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        relationship: true,
        isPrimaryContact: true,
        userId: true,
        notificationPreferences: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a new emergency contact
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate the input data
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, phone, relationship, isPrimaryContact, notificationPreferences } = validation.data;

    // If this contact will be primary, update any existing primary contact
    if (isPrimaryContact) {
      await prisma.emergencyContact.updateMany({
        where: { userId, isPrimaryContact: true },
        data: { isPrimaryContact: false },
      });
    }

    // Create the new contact with notification preferences included
    const newContact = await prisma.emergencyContact.create({
      data: {
        userId,
        name,
        email,
        phone,
        relationship,
        isPrimaryContact,
        notificationPreferences: notificationPreferences || {
          email: false,
          sms: false,
          voice: false
        }
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Contact added successfully",
      contact: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}