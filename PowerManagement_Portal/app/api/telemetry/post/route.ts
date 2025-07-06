import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const telemetrySchema = z.object({
  deviceId: z.string(),
  telemetry: z.object({
    voltage: z.array(z.number()).length(3),
    current: z.array(z.number()).length(3),
    power: z.array(z.number()).length(3),
    powerFactor: z.array(z.number()).length(3),
    temperature: z.number(),
    totalPower: z.number().optional(),
    totalEnergy: z.number().optional(),
    frequency: z.number().optional(),
    phaseStatus: z.array(z.boolean()).length(3).optional(),
    doorStatus: z.boolean().optional(),
    acPowerStatus: z.boolean().optional(),
    rtcDrift: z.number().optional()
  })
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { deviceId, telemetry } = telemetrySchema.parse(json);

    // Check if device exists
    const device = await prisma.cCMSDevice.findUnique({
      where: { deviceId }
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Create telemetry data with timestamp and required fields
    const telemetryData = {
      ...telemetry,
      timestamp: new Date(),
      totalPower: telemetry.totalPower || telemetry.power.reduce((sum, p) => sum + p, 0),
      totalEnergy: telemetry.totalEnergy || 0,
      frequency: telemetry.frequency || 50,
      phaseStatus: telemetry.phaseStatus || [true, true, true],
      doorStatus: telemetry.doorStatus || false,
      acPowerStatus: telemetry.acPowerStatus || true,
      rtcDrift: telemetry.rtcDrift || 0
    };

    // Update device with new telemetry data
    const updatedDevice = await prisma.cCMSDevice.update({
      where: { deviceId },
      data: {
        telemetry: {
          push: telemetryData
        },
        status: 'ONLINE', // Update status to online when telemetry is received
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Telemetry data posted successfully',
      timestamp: telemetryData.timestamp,
      deviceId: deviceId
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid telemetry data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to post telemetry:', error);
    return NextResponse.json(
      { error: 'Failed to post telemetry data' },
      { status: 500 }
    );
  }
} 