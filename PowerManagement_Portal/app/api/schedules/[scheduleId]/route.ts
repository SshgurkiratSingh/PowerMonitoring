import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function DELETE(_request: Request, { params }: { params: { scheduleId: string } }) {
  try {
    const { scheduleId } = params;
    await prisma.schedule.delete({ where: { id: scheduleId } });
    return NextResponse.json({ message: 'Schedule deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { scheduleId: string } }) {
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
    const updated = await prisma.schedule.update({
      where: { id: params.scheduleId },
      data: {
        deviceId,
        groupId,
        name,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        mode,
        type,
        daysOfWeek,
        isActive,
        isHoliday,
        holidayName
      },
      include: {
        device: { select: { deviceId: true, location: true } },
        group: { select: { name: true } },
      },
    });
    return NextResponse.json({ schedule: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
} 