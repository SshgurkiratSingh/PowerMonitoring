import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all device groups
export async function GET() {
  try {
    const groups = await prisma.deviceGroup.findMany({
      include: {
        devices: {
          select: {
            id: true,
            deviceId: true,
            status: true,
            location: true,
          },
        },
        _count: {
          select: {
            devices: true,
            schedules: true,
          },
        },
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching device groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device groups' },
      { status: 500 }
    );
  }
}

// POST - Create a new device group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, deviceIds } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    // Check if group name already exists
    const existingGroup = await prisma.deviceGroup.findUnique({
      where: { name },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Group name already exists' },
        { status: 400 }
      );
    }

    // Create the group
    const group = await prisma.deviceGroup.create({
      data: {
        name,
        description,
      },
    });

    // Add devices to the group if provided
    if (deviceIds && Array.isArray(deviceIds) && deviceIds.length > 0) {
      await prisma.cCMSDevice.updateMany({
        where: {
          id: {
            in: deviceIds,
          },
        },
        data: {
          groupId: group.id,
        },
      });
    }

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Error creating device group:', error);
    return NextResponse.json(
      { error: 'Failed to create device group' },
      { status: 500 }
    );
  }
} 