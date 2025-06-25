import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  deviceId?: string; // This is the CCMSDevice database ID
}

// POST: Send a control command to a device
export async function POST(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional: Add role-based authorization (e.g., only ADMIN or MAINTENANCE)
  // if (!['ADMIN', 'MAINTENANCE'].includes(currentUser.role)) {
  //   return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  // }

  const { deviceId: cCMSDeviceDBId } = params;
  if (!cCMSDeviceDBId) {
    return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { command, payload } = body; // e.g., command: "SET_CIRCUIT_STATE", payload: { circuitId: 1, state: "ON" }
                                     // e.g., command: "ADJUST_BRIGHTNESS", payload: { level: 80 }

    if (!command) {
      return NextResponse.json({ error: "Control command is required" }, { status: 400 });
    }

    const device = await prisma.cCMSDevice.findUnique({
      where: { id: cCMSDeviceDBId },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // --- Simulate sending command to the physical device ---
    // In a real system, this is where you'd integrate with an IoT service, MQTT, or direct device communication.
    console.log(`Simulating control command for device ${device.deviceId} (DB ID: ${cCMSDeviceDBId}):`);
    console.log(`User: ${currentUser.email} (Role: ${currentUser.role})`);
    console.log(`Command: ${command}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);
    // -------------------------------------------------------

    // Optionally, log this action to a separate audit log model or update the device model
    // For example, update a "lastCommand" field (if added to schema):
    // await prisma.cCMSDevice.update({
    //   where: { id: cCMSDeviceDBId },
    //   data: {
    //     lastCommandSent: command,
    //     lastCommandPayload: payload ? JSON.stringify(payload) : undefined,
    //     lastCommandTimestamp: new Date(),
    //     updatedAt: new Date() // Also update the general updatedAt timestamp
    //   }
    // });

    // For now, just a simple log and success response
    // A more robust implementation might involve updating the device's reported status
    // after the command is acknowledged by the physical device.

    return NextResponse.json({ message: `Command '${command}' sent to device ${device.deviceId} successfully.`, details: payload }, { status: 200 });

  } catch (error: any) {
    console.error(`Error sending command to device ${cCMSDeviceDBId}:`, error);
    return NextResponse.json({ error: "Internal Server Error while sending command" }, { status: 500 });
  }
}
