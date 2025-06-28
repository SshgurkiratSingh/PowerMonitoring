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