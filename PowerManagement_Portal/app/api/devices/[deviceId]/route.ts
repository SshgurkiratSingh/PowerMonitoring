import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const device = await prisma.cCMSDevice.findUnique({
      where: { deviceId: params.deviceId },
      include: {
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        schedules: {
          orderBy: { startTime: 'desc' }
        }
      }
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const body = await request.json();
    const { 
      deviceId, 
      powerRating, 
      voltage, 
      frequency, 
      incomingCurrent, 
      ipRating, 
      status, 
      location 
    } = body;

    // Validate required fields
    if (!deviceId || !powerRating || !voltage || !frequency || !incomingCurrent || !ipRating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedDevice = await prisma.cCMSDevice.update({
      where: { deviceId: params.deviceId },
      data: {
        deviceId,
        powerRating,
        voltage,
        frequency,
        incomingCurrent,
        ipRating,
        status: status || 'ONLINE',
        location: {
          coordinates: location.coordinates || [0, 0],
          address: location.address || 'Unknown Location'
        }
      },
      include: {
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        schedules: {
          orderBy: { startTime: 'desc' }
        }
      }
    });

    return NextResponse.json({
      message: 'Device updated successfully',
      device: updatedDevice
    });

  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 }
    );
  }
} 