import { PrismaClient, DeviceStatus, AlertLevel } from "@/app/generated/prisma";
import { NextResponse } from "next/server";

// Helper: Generate random float in a range
const randomInRange = (min: number, max: number, precision = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(precision));

// Helper: Validate DeviceStatus
const isValidStatus = (status: string): status is DeviceStatus =>
  Object.values(DeviceStatus).includes(status as DeviceStatus);

// Helper: Get random alert data
const getRandomAlert = () => {
  const alerts = [
    { message: "System operating normally", level: AlertLevel.INFO },
    { message: "Low voltage detected", level: AlertLevel.WARNING },
    { message: "High temperature warning", level: AlertLevel.WARNING },
    { message: "Phase imbalance detected", level: AlertLevel.CRITICAL },
    { message: "Power consumption spike", level: AlertLevel.WARNING },
    { message: "Device maintenance required", level: AlertLevel.INFO },
    { message: "Critical voltage drop", level: AlertLevel.CRITICAL },
  ];
  return alerts[Math.floor(Math.random() * alerts.length)];
};

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    let { deviceCount, powerRating, status, location } = await request.json();
    const count = parseInt(deviceCount);

    // Validate status
    if (!isValidStatus(status)) {
      status = DeviceStatus.ONLINE; // Default to ONLINE if invalid
    }

    const devices = [];
    const baseTimestamp = Date.now();

    for (let i = 0; i < count; i++) {
      // Random telemetry data
      const telemetryData = {
        timestamp: new Date(baseTimestamp - i * 60000),
        voltage: [
          randomInRange(220, 240),
          randomInRange(220, 240),
          randomInRange(220, 240),
        ],
        current: [
          randomInRange(30, 40),
          randomInRange(30, 40),
          randomInRange(30, 40),
        ],
        power: [
          randomInRange(7, 9),
          randomInRange(7, 9),
          randomInRange(7, 9),
        ],
        powerFactor: [
          randomInRange(0.9, 1.0),
          randomInRange(0.9, 1.0),
          randomInRange(0.9, 1.0),
        ],
        temperature: randomInRange(40, 50),
      };

      // Slightly randomize location
      const coordinates = [
        parseFloat(location.longitude) + randomInRange(-0.01, 0.01, 6),
        parseFloat(location.latitude) + randomInRange(-0.01, 0.01, 6),
      ];

      // Get random alert data
      const alertData = getRandomAlert();

      // Create device with embedded telemetry
      const device = await prisma.cCMSDevice.create({
        data: {
          deviceId: `CCMS-${baseTimestamp}-${i}`,
          powerRating: `${powerRating}kW`,
          voltage: "415V",
          frequency: "50Hz",
          incomingCurrent: "48A",
          ipRating: "IP65",
          status: status as DeviceStatus,
          location: {
            coordinates,
            address: location.address,
          },
          telemetry: [telemetryData], // Array of telemetry data
          latestAlert: alertData.message, // Updated field name
        },
      });

      // Create corresponding Alert record
      await prisma.alert.create({
        data: {
          deviceId: device.id,
          message: alertData.message,
          level: alertData.level,
        },
      });

      // Generate additional historical alerts (optional)
      const additionalAlerts = Math.floor(Math.random() * 3) + 1; // 1-3 additional alerts
      for (let j = 0; j < additionalAlerts; j++) {
        const historicalAlert = getRandomAlert();
        await prisma.alert.create({
          data: {
            deviceId: device.id,
            message: historicalAlert.message,
            level: historicalAlert.level,
            createdAt: new Date(baseTimestamp - (j + 1) * 3600000), // Hours ago
          },
        });
      }

      devices.push(device);
    }

    return NextResponse.json(
      { message: `${count} devices created successfully with alerts`, devices },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating test data:", error);
    return NextResponse.json(
      {
        message: "Failed to generate test data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
