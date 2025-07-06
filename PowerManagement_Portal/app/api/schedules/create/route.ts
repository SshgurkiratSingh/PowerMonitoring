import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const {
      deviceId,
      groupId,
      name,
      description,
      startTime,
      endTime,
      mode,
      type,
      daysOfWeek,
      isActive,
      isHoliday,
      holidayName
    } = await request.json();
    if ((!deviceId && !groupId) || !startTime || !endTime || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const schedule = await prisma.schedule.create({
      data: {
        deviceId,
        groupId,
        name,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        mode,
        type,
        daysOfWeek,
        isActive,
        isHoliday,
        holidayName
      },
      include: {
        device: {
          select: {
            deviceId: true,
            location: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}