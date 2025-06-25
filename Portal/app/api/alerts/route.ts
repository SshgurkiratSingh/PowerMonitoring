import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser"; // For authentication/authorization

// GET: List all alerts globally
export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional: Add role-based authorization if needed (e.g., only ADMINS can see all alerts)
  // if (currentUser.role !== 'ADMIN') {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20"); // Default to 20 alerts per page
    const level = searchParams.get("level"); // Filter by AlertLevel
    const deviceIdQuery = searchParams.get("deviceId"); // Filter by CCMSDevice unique deviceId (not DB id)

    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (level && ["INFO", "WARNING", "CRITICAL"].includes(level.toUpperCase())) {
      whereClause.level = level.toUpperCase();
    }
    if (deviceIdQuery) {
      // Need to find the device's database ID first if filtering by user-facing deviceId
      const device = await prisma.cCMSDevice.findUnique({ where: { deviceId: deviceIdQuery }});
      if (device) {
        whereClause.deviceId = device.id; // Prisma uses the database ID for relation
      } else {
        // If deviceIdQuery is provided but not found, return empty results for this filter
        return NextResponse.json({
          alerts: [],
          totalAlerts: 0,
          totalPages: 0,
          currentPage: page,
        });
      }
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      include: {
        device: { // Include related device information
          select: {
            deviceId: true, // The user-friendly device ID
            id: true,       // The database ID of the device
            location: true, // Include location for context
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest alerts first
      },
      skip: skip,
      take: limit,
    });

    const totalAlerts = await prisma.alert.count({ where: whereClause });
    const totalPages = Math.ceil(totalAlerts / limit);

    return NextResponse.json({
      alerts,
      totalAlerts,
      totalPages,
      currentPage: page,
    });

  } catch (error) {
    console.error("Error fetching all alerts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
