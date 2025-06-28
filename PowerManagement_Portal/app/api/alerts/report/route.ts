import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const alertSchema = z.object({
  deviceId: z.string(),
  message: z.string(),
  level: z.enum(['INFO', 'WARNING', 'CRITICAL'])
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = alertSchema.parse(json);

    const device = await prisma.cCMSDevice.findUnique({
      where: { deviceId: body.deviceId }
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const alert = await prisma.alert.create({
      data: {
        deviceId: device.id,
        message: body.message,
        level: body.level
      }
    });

    // Update the device's latest alert
    await prisma.cCMSDevice.update({
      where: { id: device.id },
      data: { alert: body.message }
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid alert data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}