import { NextResponse } from "next/server";
// Update auth import to use currentUser instead
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Get the current user instead of using auth()
    const user = await currentUser();
    const userId = user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const type = searchParams.get("type") || undefined; // Filter by alert type

    // Prepare filter conditions with proper typing
    const whereCondition: Prisma.AlertWhereInput = { userId };
    if (type && (type === "prediction" || type === "onset")) {
      whereCondition.type = type;
    }

    // Get alerts with pagination
    const [alerts, totalCount] = await Promise.all([
      prisma.alert.findMany({
        where: whereCondition,
        include: {
          notificationsSent: {
            include: {
              contact: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  isPrimaryContact: true,
                }
              }
            }
          }
        },
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.alert.count({ where: whereCondition }),
    ]);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      alerts,
      pagination: {
        total: totalCount,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}