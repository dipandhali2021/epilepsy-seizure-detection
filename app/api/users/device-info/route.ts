import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Get the authenticated user
    const { userId } = auth();
    
    // Parse the URL to get query parameters
    const url = new URL(req.url);
    const requestedUserId = url.searchParams.get("userId");

    // Ensure the user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If a specific user ID is requested, verify the requester has permission
    // Only allow if the requested ID matches the authenticated user or the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (requestedUserId && requestedUserId !== userId && user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine which user ID to look up
    const targetUserId = requestedUserId || userId;

    // Fetch user device information
    const userDevice = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { 
        deviceId: true,
        updatedAt: true
      },
    });

    if (!userDevice) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the most recent alert for this user's device (if any)
    let lastActive = userDevice.updatedAt;
    if (userDevice.deviceId) {
      const latestAlert = await prisma.alert.findFirst({
        where: { 
          userId: targetUserId,
          deviceId: userDevice.deviceId 
        },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });

      if (latestAlert) {
        lastActive = latestAlert.timestamp;
      }
    }

    return NextResponse.json({
      deviceId: userDevice.deviceId,
      lastActive: lastActive
    });
  } catch (error) {
    console.error("Error fetching device info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}