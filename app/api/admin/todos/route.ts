import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

async function isAdmin(userId: string) {
  const user = await clerkClient.users.getUser(userId);
  return user.publicMetadata.role === "admin";
}

export async function GET(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const user = await prisma.user.findUnique({
      where: { email: email || "" },
      include: {
        alerts: {
          orderBy: { createdAt: "desc" },
          take: ITEMS_PER_PAGE,
          skip: (page - 1) * ITEMS_PER_PAGE,
          include: {
            notificationsSent: true
          }
        },
        emergencyContacts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null, totalPages: 0, currentPage: 1 });
    }

    const totalAlerts = await prisma.alert.count({
      where: { userId: user.id },
    });

    const totalPages = Math.ceil(totalAlerts / ITEMS_PER_PAGE);

    return NextResponse.json({
      user,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, alertId, alertAcknowledged, userRole } = await req.json();

    if (alertId !== undefined && alertAcknowledged !== undefined) {
      // Update alert notification acknowledgment status
      const updatedNotification = await prisma.notificationSent.update({
        where: { id: alertId },
        data: { acknowledged: alertAcknowledged },
      });
      return NextResponse.json(updatedNotification);
    } else if (userRole !== undefined) {
      // Update user role
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: userRole },
      });
      return NextResponse.json(updatedUser);
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { alertId } = await req.json();

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    await prisma.alert.delete({
      where: { id: alertId },
    });

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
