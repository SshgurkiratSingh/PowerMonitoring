import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { AlertType } from '@/types';

const prisma = new PrismaClient();

// GET - Get alert thresholds for a device
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const thresholds = await prisma.alertThreshold.findMany({
      where: { deviceId },
      orderBy: { type: 'asc' },
    });

    return NextResponse.json({ thresholds });
  } catch (error) {
    console.error('Error fetching alert thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert thresholds' },
      { status: 500 }
    );
  }
}

// POST - Create or update alert thresholds
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, thresholds } = body;

    if (!deviceId || !thresholds || !Array.isArray(thresholds)) {
      return NextResponse.json(
        { error: 'Device ID and thresholds array are required' },
        { status: 400 }
      );
    }

    // Verify device exists
    const device = await prisma.cCMSDevice.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const results = [];

    for (const threshold of thresholds) {
      const { type, minValue, maxValue, isEnabled } = threshold;

      if (!type || !Object.values(AlertType).includes(type)) {
        return NextResponse.json(
          { error: `Invalid alert type: ${type}` },
          { status: 400 }
        );
      }

      // Upsert threshold
      const result = await prisma.alertThreshold.upsert({
        where: {
          deviceId_type: {
            deviceId,
            type: type as AlertType,
          },
        },
        update: {
          minValue,
          maxValue,
          isEnabled: isEnabled ?? true,
        },
        create: {
          deviceId,
          type: type as AlertType,
          minValue,
          maxValue,
          isEnabled: isEnabled ?? true,
        },
      });

      results.push(result);
    }

    return NextResponse.json({ thresholds: results });
  } catch (error) {
    console.error('Error updating alert thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to update alert thresholds' },
      { status: 500 }
    );
  }
}

// DELETE - Delete alert threshold
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const type = searchParams.get('type');

    if (!deviceId || !type) {
      return NextResponse.json(
        { error: 'Device ID and alert type are required' },
        { status: 400 }
      );
    }

    await prisma.alertThreshold.delete({
      where: {
        deviceId_type: {
          deviceId,
          type: type as AlertType,
        },
      },
    });

    return NextResponse.json({ message: 'Threshold deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert threshold:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert threshold' },
      { status: 500 }
    );
  }
} 