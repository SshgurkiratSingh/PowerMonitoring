import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser"; // For authentication/authorization

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional: Add role-based authorization if only certain users can create devices
  // if (currentUser.role !== 'ADMIN') {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  try {
    const body = await request.json();
    const {
      deviceId,
      powerRating,
      voltage,
      frequency,
      incomingCurrent,
      ipRating,
      location, // Expected: { coordinates: [lon, lat], address: "string" }
      security, // Expected: { passwordLevel1: "string", passwordLevel2: "string", tamperSensor?: boolean }
      status,   // Optional, defaults to ONLINE
    } = body;

    // Basic validation
    if (!deviceId || !powerRating || !voltage || !frequency || !incomingCurrent || !ipRating || !location || !security) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!location.coordinates || !location.address || !security.passwordLevel1 || !security.passwordLevel2) {
        return NextResponse.json({ error: "Missing fields within location or security objects" }, { status: 400 });
    }

    const newDevice = await prisma.cCMSDevice.create({
      data: {
        deviceId,
        powerRating,
        voltage,
        frequency,
        incomingCurrent,
        ipRating,
        status: status || 'ONLINE', // Default to ONLINE if not provided
        location: {
          coordinates: location.coordinates,
          address: location.address,
        },
        security: {
          passwordLevel1: security.passwordLevel1,
          passwordLevel2: security.passwordLevel2,
          tamperSensor: security.tamperSensor !== undefined ? security.tamperSensor : true, // Default tamperSensor
        },
        // telemetry, schedules, and alert will be empty or handled by other endpoints/processes
      },
    });

    return NextResponse.json(newDevice, { status: 201 });
  } catch (error: any) {
    console.error("Error creating CCMSDevice:", error);
    // Check for unique constraint violation for deviceId
    if (error.code === 'P2002' && error.meta?.target?.includes('deviceId')) {
        return NextResponse.json({ error: "Device with this deviceId already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const devices = await prisma.cCMSDevice.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        // schedules: true, // Not strictly needed for the main device list overview, can add if required by UI later
        telemetry: { // Get the latest telemetry entry for each device
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        // The 'alert' field (latest alert string) is directly on CCMSDevice, so it's fetched by default.
      },
    });
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Error fetching CCMSDevices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
