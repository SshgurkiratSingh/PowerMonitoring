import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  deviceId?: string;   // CCMSDevice database ID
  scheduleId?: string; // Schedule database ID
}

// PUT: Update a specific schedule
export async function PUT(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deviceId: cCMSDeviceDBId, scheduleId } = params;
  if (!cCMSDeviceDBId || !scheduleId) {
    return NextResponse.json({ error: "Device ID and Schedule ID are required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { startTime, endTime, mode } = body;

    // Validate that the device exists (optional, but good practice)
    const device = await prisma.cCMSDevice.findUnique({ where: { id: cCMSDeviceDBId } });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (mode) updateData.mode = mode;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    const updatedSchedule = await prisma.schedule.updateMany({ // updateMany to ensure deviceId matches
      where: {
        id: scheduleId,
        deviceId: cCMSDeviceDBId, // Ensure the schedule belongs to the specified device
      },
      data: updateData,
    });

    if (updatedSchedule.count === 0) {
        // This means either the scheduleId was not found, or it didn't belong to the cCMSDeviceDBId
        const existingSchedule = await prisma.schedule.findUnique({ where: { id: scheduleId }});
        if (!existingSchedule) {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }
        // If it exists but count is 0, it means it didn't match the deviceId
        return NextResponse.json({ error: "Schedule not found under the specified device or no changes made" }, { status: 404 });
    }

    // Fetch the updated schedule to return it
    const scheduleToReturn = await prisma.schedule.findUnique({where: {id: scheduleId}});


    return NextResponse.json(scheduleToReturn);
  } catch (error: any) {
    console.error(`Error updating schedule ${scheduleId} for device ${cCMSDeviceDBId}:`, error);
    if (error.code === 'P2025') { // Prisma's error code for record to update not found (if using update unique)
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a specific schedule
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deviceId: cCMSDeviceDBId, scheduleId } = params;
  if (!cCMSDeviceDBId || !scheduleId) {
    return NextResponse.json({ error: "Device ID and Schedule ID are required" }, { status: 400 });
  }

  try {
    // Validate that the device exists (optional)
    const device = await prisma.cCMSDevice.findUnique({ where: { id: cCMSDeviceDBId } });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const result = await prisma.schedule.deleteMany({
      where: {
        id: scheduleId,
        deviceId: cCMSDeviceDBId, // Ensure deletion only if schedule belongs to the device
      },
    });

    if (result.count === 0) {
      // Check if the schedule exists at all to give a more specific error
      const existingSchedule = await prisma.schedule.findUnique({ where: { id: scheduleId }});
      if (!existingSchedule) {
          return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
      }
      // If it exists but count is 0, it means it didn't match the deviceId
      return NextResponse.json({ error: "Schedule not found under the specified device" }, { status: 404 });
    }

    return NextResponse.json({ message: "Schedule deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting schedule ${scheduleId} for device ${cCMSDeviceDBId}:`, error);
     if (error.code === 'P2025') { // Prisma's error code for record to delete not found
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
