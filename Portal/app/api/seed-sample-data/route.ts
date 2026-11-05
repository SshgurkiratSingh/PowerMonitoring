import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { DeviceStatus, AlertLevel, ScheduleMode, UserRole } from "@prisma/client";

// Helper function to generate random telemetry data
const generateRandomTelemetry = (baseTime: Date, count: number) => {
  const telemetry = [];
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(baseTime.getTime() + i * 5 * 60000); // 5 minutes apart
    telemetry.push({
      timestamp,
      voltage: [220 + Math.random() * 10, 221 + Math.random() * 10, 219 + Math.random() * 10].map(v => parseFloat(v.toFixed(2))),
      current: [5 + Math.random() * 5, 5.5 + Math.random() * 5, 4.5 + Math.random() * 5].map(c => parseFloat(c.toFixed(2))),
      power: [1.0 + Math.random() * 0.5, 1.1 + Math.random() * 0.5, 0.9 + Math.random() * 0.5].map(p => parseFloat(p.toFixed(2))),
      powerFactor: [0.9 + Math.random() * 0.05, 0.92 + Math.random() * 0.05, 0.88 + Math.random() * 0.05].map(pf => parseFloat(pf.toFixed(2))),
      temperature: parseFloat((25 + Math.random() * 10).toFixed(2)),
    });
  }
  return telemetry;
};

export async function POST(request: Request) {
  // No authentication check as per user request to make it accessible to all.
  // In a real app, this should be heavily restricted.
  console.log("Attempting to seed sample data. This endpoint should be restricted in production!");

  try {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 1); // Start telemetry data from yesterday

    // --- 1. Create Sample Users (if they don't exist, for ownership or reference) ---
    // This part is optional if devices are not tied to users, or handled by default auth.
    // For now, we'll skip creating specific users for seeding unless required.
    // Example: ensure an ADMIN user exists
    // await prisma.user.upsert({
    //   where: { email: 'admin@example.com' },
    //   update: {},
    //   create: {
    //     email: 'admin@example.com',
    //     name: 'Admin User',
    //     hashedPassword: 'somehashedpassword', // Use bcrypt in real app
    //     role: UserRole.ADMIN,
    //   },
    // });


    // --- 2. Create Sample CCMS Devices ---
    const deviceIdsToCreate = ["CCMS-SAMPLE-001", "CCMS-SAMPLE-002", "CCMS-SAMPLE-003"];
    const createdDeviceIds: string[] = [];

    for (const deviceId of deviceIdsToCreate) {
      const existingDevice = await prisma.cCMSDevice.findUnique({ where: { deviceId } });
      if (existingDevice) {
        console.log(`Device ${deviceId} already exists. Skipping creation, but will add related data if needed.`);
        createdDeviceIds.push(existingDevice.id); // Use existing device DB ID
        continue;
      }

      const newDevice = await prisma.cCMSDevice.create({
        data: {
          deviceId,
          powerRating: "10kW",
          voltage: "415V",
          frequency: "50Hz",
          incomingCurrent: "15A",
          ipRating: "IP65",
          status: Math.random() > 0.7 ? DeviceStatus.ONLINE : (Math.random() > 0.5 ? DeviceStatus.OFFLINE : DeviceStatus.FAULT),
          location: {
            coordinates: [
              parseFloat((-122.4194 + (Math.random() - 0.5) * 0.1).toFixed(6)), // Random Lon around SF
              parseFloat((37.7749 + (Math.random() - 0.5) * 0.1).toFixed(6))    // Random Lat around SF
            ],
            address: `Sample Address ${Math.floor(Math.random() * 1000)} Test Street, Sample City`,
          },
          security: {
            passwordLevel1: "pass1",
            passwordLevel2: "pass2",
            tamperSensor: Math.random() > 0.5,
          },
          telemetry: generateRandomTelemetry(baseDate, 10), // Add 10 telemetry points for new devices
          alert: Math.random() > 0.8 ? "Initial Sample Alert: Low Voltage Detected" : null,
        },
      });
      createdDeviceIds.push(newDevice.id);
      console.log(`Created sample device: ${newDevice.deviceId} (DB ID: ${newDevice.id})`);
    }

    if (createdDeviceIds.length === 0 && deviceIdsToCreate.length > 0) {
        // This case happens if all devices already existed and no new ones were made.
        // We can still proceed to add alerts/schedules to them if needed.
        // For this example, we'll primarily focus on adding to newly created or specifically found ones.
        const existingSampleDevices = await prisma.cCMSDevice.findMany({
            where: { deviceId: { in: deviceIdsToCreate } },
            select: { id: true }
        });
        createdDeviceIds.push(...existingSampleDevices.map(d => d.id));
    }


    // --- 3. Create Sample Alerts for these devices ---
    if (createdDeviceIds.length > 0) {
      const sampleAlerts = [
        { message: "Communication Lost with Panel", level: AlertLevel.CRITICAL },
        { message: "Overcurrent detected on Phase 2", level: AlertLevel.WARNING },
        { message: "Scheduled maintenance upcoming", level: AlertLevel.INFO },
        { message: "Tamper Sensor Activated", level: AlertLevel.CRITICAL },
        { message: "Firmware update available", level: AlertLevel.INFO },
      ];

      for (const deviceDbId of createdDeviceIds) {
        // Add 1-2 random alerts to each sample device
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
          const randomAlert = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
          await prisma.alert.create({
            data: {
              deviceId: deviceDbId,
              message: `${randomAlert.message} (Device ${await prisma.cCMSDevice.findUnique({where: {id: deviceDbId}, select: {deviceId: true}}).then(d => d?.deviceId)})`,
              level: randomAlert.level,
              createdAt: new Date(baseDate.getTime() + Math.random() * 24 * 60 * 60000) // Random time in the last day
            },
          });
        }
      }
      console.log(`Added sample alerts for ${createdDeviceIds.length} devices.`);
    }

    // --- 4. Create Sample Schedules for these devices ---
    if (createdDeviceIds.length > 0) {
      for (const deviceDbId of createdDeviceIds) {
        // Add 1-2 sample schedules
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
          const startTime = new Date();
          startTime.setHours(Math.floor(Math.random() * 10) + 18, 0, 0, 0); // Evening start
          const endTime = new Date(startTime.getTime() + (Math.floor(Math.random() * 4) + 4) * 60 * 60000); // 4-8 hours duration

          await prisma.schedule.create({
            data: {
              deviceId: deviceDbId,
              startTime,
              endTime,
              mode: Math.random() > 0.5 ? ScheduleMode.AUTO : ScheduleMode.TWILIGHT,
            },
          });
        }
      }
      console.log(`Added sample schedules for ${createdDeviceIds.length} devices.`);
    }

    return NextResponse.json({ message: "Sample data seeding initiated. Check server logs and application for new data." }, { status: 200 });

  } catch (error: any) {
    console.error("Error seeding sample data:", error);
    return NextResponse.json({ error: "Failed to seed sample data.", details: error.message }, { status: 500 });
  }
}
