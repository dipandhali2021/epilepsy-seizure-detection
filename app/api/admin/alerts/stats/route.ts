import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify that the user is an admin
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata.role as string | undefined;

    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get alert statistics
    const [
      totalCount,
      predictionsCount,
      onsetsCount,
      acknowledgedCount
    ] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({
        where: { type: "prediction" }
      }),
      prisma.alert.count({
        where: { type: "onset" }
      }),
      prisma.notificationSent.count({
        where: { acknowledged: true }
      })
    ]);

    return NextResponse.json({
      total: totalCount,
      predictions: predictionsCount,
      onsets: onsetsCount,
      acknowledged: acknowledgedCount
    });
  } catch (error) {
    console.error("Error fetching alert statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}