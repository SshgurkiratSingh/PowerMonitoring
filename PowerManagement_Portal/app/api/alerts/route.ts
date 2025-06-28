import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        device: {
          select: {
            deviceId: true,
            location: true,
          },
        },
      },
    });
    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json({ alerts: [], error: 'Failed to fetch alerts' }, { status: 500 });
  }
} 