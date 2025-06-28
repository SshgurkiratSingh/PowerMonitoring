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