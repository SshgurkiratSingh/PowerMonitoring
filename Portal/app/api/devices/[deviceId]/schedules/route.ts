import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  deviceId?: string; // This is the CCMSDevice database ID
}

// POST: Create a new schedule for a specific device
export async function POST(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deviceId: cCMSDeviceDBId } = params;
  if (!cCMSDeviceDBId) {
    return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { startTime, endTime, mode } = body;

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "startTime and endTime are required" }, { status: 400 });
    }

    // Validate that the device exists
    const device = await prisma.cCMSDevice.findUnique({ where: { id: cCMSDeviceDBId } });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        deviceId: cCMSDeviceDBId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        mode: mode || 'AUTO', // Default to AUTO
      },
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error: any) {
    console.error(`Error creating schedule for device ${cCMSDeviceDBId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: List all schedules for a specific device
export async function GET(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deviceId: cCMSDeviceDBId } = params;
  if (!cCMSDeviceDBId) {
    return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
  }

  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        deviceId: cCMSDeviceDBId,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error(`Error fetching schedules for device ${cCMSDeviceDBId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
