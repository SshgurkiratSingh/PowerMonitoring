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
    temperature: z.number()
  })
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { deviceId, telemetry } = telemetrySchema.parse(json);

    const device = await prisma.cCMSDevice.update({
      where: { deviceId },
      data: {
        telemetry: {
          push: {
            ...telemetry,
            timestamp: new Date()
          }
        }
      }
    });

    return NextResponse.json({ success: true, device });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid telemetry data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update telemetry:', error);
    return NextResponse.json(
      { error: 'Failed to update telemetry' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!deviceId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
    }

    const device = await prisma.cCMSDevice.findUnique({
      where: { deviceId },
      select: { telemetry: true }
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Make end date inclusive
    
    const filteredTelemetry = (device.telemetry || []).filter((entry: any) => {
      const ts = new Date(entry.timestamp);
      return ts >= start && ts <= end;
    });

    return NextResponse.json({ deviceId, telemetry: filteredTelemetry });
  } catch (error) {
    console.error('Failed to fetch telemetry report:', error);
    return NextResponse.json({ error: 'Failed to fetch telemetry report' }, { status: 500 });
  }
}