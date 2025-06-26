import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { deviceCount, powerRating, status, location } = await request.json();

    const devices = [];
    const count = parseInt(deviceCount);

    for (let i = 0; i < count; i++) {
      const device = await prisma.cCMSDevice.create({
        data: {
          deviceId: `CCMS-${Date.now()}-${i}`,
          powerRating: `${powerRating}kW`,
          voltage: "415V",
          frequency: "50Hz",
          incomingCurrent: "48A",
          ipRating: "IP65",
          status: status,
          location: {
            coordinates: [
              parseFloat(location.longitude),
              parseFloat(location.latitude),
            ],
            address: location.address,
          },
          telemetry: {
            create: {
              timestamp: new Date(),
              voltage: [230.5, 231.2, 229.8],
              current: [35.2, 34.8, 35.5],
              power: [8.1, 8.0, 8.2],
              powerFactor: [0.95, 0.94, 0.96],
              temperature: 45.5,
            },
          },
        },
      });
      devices.push(device);
    }

    return NextResponse.json(
      { message: "Test data generated successfully", devices },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating test data:", error);
    return NextResponse.json(
      { message: "Failed to generate test data" },
      { status: 500 }
    );
  }
}