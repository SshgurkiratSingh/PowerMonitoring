import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createDeviceSchema = z.object({
  deviceId: z.string(),
  powerRating: z.string(),
  voltage: z.string(),
  frequency: z.string(),
  incomingCurrent: z.string(),
  ipRating: z.string(),
  location: z.object({
    coordinates: z.array(z.number()).length(2),
    address: z.string()
  })
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createDeviceSchema.parse(json);

    const device = await prisma.cCMSDevice.create({
      data: {
        ...body,
        status: 'ONLINE',
        alert: ''
      }
    });

    return NextResponse.json(device);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create device:', error);
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    );
  }
}