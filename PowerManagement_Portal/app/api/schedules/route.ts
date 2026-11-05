import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        device: {
          select: {
            deviceId: true,
            location: true,
          },
        },
      },
    });
    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ schedules: [], error: 'Failed to fetch schedules' }, { status: 500 });
  }
}