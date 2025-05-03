import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Function to generate a device ID in the format DEV-XXXXXXX
function generateDeviceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars like 0, O, 1, I
  let result = 'DEV-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Input validation schema
const requestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  regenerate: z.boolean().optional().default(false)
});

export async function POST(req: Request) {
  try {
    // Get the authenticated user
    const { userId: authenticatedUserId } = auth();
    
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId, regenerate } = validation.data;

    // Check if the authenticated user is allowed to perform this action
    // Users can only update their own device ID unless they are an admin
    if (userId !== authenticatedUserId) {
      // Check if the authenticated user is an admin
      const user = await prisma.user.findUnique({
        where: { id: authenticatedUserId },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "Not authorized to generate device ID for other users" },
          { status: 403 }
        );
      }
    }

    // Check if the user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { deviceId: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if a device ID already exists and if regeneration is requested
    if (targetUser.deviceId && !regenerate) {
      return NextResponse.json(
        { error: "User already has a device ID. Set regenerate=true to create a new one." },
        { status: 400 }
      );
    }

    // Generate a new unique device ID
    let newDeviceId = generateDeviceId();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      newDeviceId = generateDeviceId();
      attempts++;

      // Check if this device ID already exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { deviceId: newDeviceId }
      });

      if (!existingUser) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Failed to generate a unique device ID after multiple attempts" },
        { status: 500 }
      );
    }

    // Update the user's device ID in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { deviceId: newDeviceId },
      select: { deviceId: true, name: true, email: true }
    });

    return NextResponse.json({
      success: true,
      message: regenerate ? "Device ID regenerated successfully" : "Device ID generated successfully",
      deviceId: updatedUser.deviceId
    });

  } catch (error) {
    console.error("Error generating device ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}