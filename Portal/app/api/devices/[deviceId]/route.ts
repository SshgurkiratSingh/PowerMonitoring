import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  deviceId?: string; // This will be the database ID of the CCMSDevice
}

// GET a single device by its database ID
export async function GET(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deviceId: cCMSDeviceDBId } = params;

  if (!cCMSDeviceDBId || typeof cCMSDeviceDBId !== 'string') {
    return NextResponse.json({ error: "Invalid device ID" }, { status: 400 });
  }

  try {
    const device = await prisma.cCMSDevice.findUnique({
      where: {
        id: cCMSDeviceDBId,
      },
      // Optionally include related data
      // include: {
      //   schedules: true,
      //   telemetry: { orderBy: { timestamp: 'desc' } },
      //   alerts: { orderBy: { createdAt: 'desc' } },
      // },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error(`Error fetching device with ID ${cCMSDeviceDBId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a single device by its database ID
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional: Add role-based authorization
  // if (currentUser.role !== 'ADMIN') {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  const { deviceId: cCMSDeviceDBId } = params;

  if (!cCMSDeviceDBId || typeof cCMSDeviceDBId !== 'string') {
    return NextResponse.json({ error: "Invalid device ID" }, { status: 400 });
  }

  try {
    const device = await prisma.cCMSDevice.findUnique({
      where: { id: cCMSDeviceDBId },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Add any cascading delete logic if necessary (e.g., delete related schedules, alerts)
    // Prisma's default behavior depends on schema relations.
    // For example, if schedules or alerts should be deleted when a device is deleted,
    // this needs to be handled here or via schema `onDelete` directives if supported by MongoDB.
    // For now, we assume related data might be orphaned or handled by schema if possible.

    // Before deleting CCMSDevice, delete related Schedules and Alerts
    // This is important as MongoDB doesn't always cascade deletes through relations automatically in Prisma
    await prisma.schedule.deleteMany({
      where: { deviceId: cCMSDeviceDBId },
    });
    await prisma.alert.deleteMany({
      where: { deviceId: cCMSDeviceDBId },
    });
    // Note: TelemetryData is an embedded array, so it gets deleted with the device.


    await prisma.cCMSDevice.delete({
      where: {
        id: cCMSDeviceDBId,
      },
    });

    return NextResponse.json({ message: "Device deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting device with ID ${cCMSDeviceDBId}:`, error);
    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ error: "Device not found or already deleted" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT (Update) a single device by its database ID
export async function PUT(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional: Add role-based authorization
  // if (currentUser.role !== 'ADMIN') {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  const { deviceId: cCMSDeviceDBId } = params;

  if (!cCMSDeviceDBId || typeof cCMSDeviceDBId !== 'string') {
    return NextResponse.json({ error: "Invalid device ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    // Destructure only the fields that are allowed to be updated
    const {
      powerRating,
      voltage,
      frequency,
      incomingCurrent,
      ipRating,
      location, // Expected: { coordinates: [lon, lat], address: "string" }
      security, // Expected: { passwordLevel1: "string", passwordLevel2: "string", tamperSensor?: boolean }
      status,
      alert, // For updating the latest alert message string on CCMSDevice
    } = body;

    // Basic validation for complex types if provided
    if (location && (!location.coordinates || !location.address)) {
        return NextResponse.json({ error: "Missing fields within location object" }, { status: 400 });
    }
    if (security && (!security.passwordLevel1 || !security.passwordLevel2)) {
        return NextResponse.json({ error: "Missing fields within security object" }, { status: 400 });
    }

    // Construct the data object carefully, only including fields that are present in the body
    const updateData: any = {};
    if (powerRating !== undefined) updateData.powerRating = powerRating;
    if (voltage !== undefined) updateData.voltage = voltage;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (incomingCurrent !== undefined) updateData.incomingCurrent = incomingCurrent;
    if (ipRating !== undefined) updateData.ipRating = ipRating;
    if (location !== undefined) updateData.location = location;
    if (security !== undefined) updateData.security = security;
    if (status !== undefined) updateData.status = status;
    if (alert !== undefined) updateData.alert = alert;


    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    updateData.updatedAt = new Date(); // Manually update the timestamp

    const updatedDevice = await prisma.cCMSDevice.update({
      where: {
        id: cCMSDeviceDBId,
      },
      data: updateData,
    });

    return NextResponse.json(updatedDevice);
  } catch (error: any) {
    console.error(`Error updating device with ID ${cCMSDeviceDBId}:`, error);
    if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }
    // Handle potential unique constraint violation if deviceId were updatable (it's not in this design)
    // if (error.code === 'P2002' && error.meta?.target?.includes('deviceId')) {
    //     return NextResponse.json({ error: "Another device with this deviceId already exists." }, { status: 409 });
    // }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
