import { PrismaClient, DeviceStatus } from "@/app/generated/prisma"; // <-- Use your custom output path!
import { NextResponse } from "next/server";

// Helper: Generate random float in a range
const randomInRange = (min: number, max: number, precision = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(precision));

// Helper: Validate DeviceStatus
const isValidStatus = (status: string): status is DeviceStatus =>
  Object.values(DeviceStatus).includes(status as DeviceStatus);

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
      const telemetry = {
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

      // Create device
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
          telemetry,
          alert: [
            "",
            "Low voltage detected",
            "High temperature warning",
            "Phase imbalance",
          ][Math.floor(Math.random() * 4)],
        },
      });
      devices.push(device);
    }

    return NextResponse.json(
      { message: `${count} devices created successfully`, devices },
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
