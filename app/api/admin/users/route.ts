import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
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

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get users from database
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              emergencyContacts: true,
              alerts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    // Get additional user info from Clerk
    const userIds = users.map((user) => user.id);
    
    // Use getUsers instead of getUserList and handle the result properly
    const clerkUsers = await Promise.all(
      userIds.map(async (id) => {
        try {
          return await clerkClient.users.getUser(id);
        } catch (error) {
          console.error(`Failed to get Clerk user ${id}:`, error);
          return null;
        }
      })
    );

    // Merge Prisma and Clerk data
    const enrichedUsers = users.map((user) => {
      // Filter out null values and find matching clerk user
      const clerkUser = clerkUsers
        .filter(Boolean)
        .find((cu) => cu?.id === user.id);
        
      return {
        ...user,
        email: user.email || clerkUser?.emailAddresses[0]?.emailAddress || "",
        name: user.name || clerkUser?.firstName || "Unknown",
        lastSignIn: clerkUser?.lastSignInAt,
        imageUrl: clerkUser?.imageUrl,
      };
    });

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}