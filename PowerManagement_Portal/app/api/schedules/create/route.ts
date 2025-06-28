import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { deviceId, startTime, endTime, mode } = await request.json();
    if (!deviceId || !startTime || !endTime || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const schedule = await prisma.schedule.create({
      data: {
        deviceId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        mode,
      },
      include: {
        device: {
          select: {
            deviceId: true,
            location: true,
          },
        },
      },
    });
    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}