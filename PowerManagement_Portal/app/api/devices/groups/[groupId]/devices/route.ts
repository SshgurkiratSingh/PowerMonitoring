import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { deviceIds } = await request.json();

    if (!deviceIds || !Array.isArray(deviceIds)) {
      return NextResponse.json(
        { error: 'Device IDs array is required' },
        { status: 400 }
      );
    }

    // Add devices to the group
    await prisma.cCMSDevice.updateMany({
      where: { id: { in: deviceIds } },
      data: { groupId }
    });

    return NextResponse.json({
      message: 'Devices added to group successfully'
    });
  } catch (error) {
    console.error('Error adding devices to group:', error);
    return NextResponse.json(
      { error: 'Failed to add devices to group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { deviceIds } = await request.json();

    if (!deviceIds || !Array.isArray(deviceIds)) {
      return NextResponse.json(
        { error: 'Device IDs array is required' },
        { status: 400 }
      );
    }

    // Remove devices from the group
    await prisma.cCMSDevice.updateMany({
      where: { 
        id: { in: deviceIds },
        groupId 
      },
      data: { groupId: null }
    });

    return NextResponse.json({
      message: 'Devices removed from group successfully'
    });
  } catch (error) {
    console.error('Error removing devices from group:', error);
    return NextResponse.json(
      { error: 'Failed to remove devices from group' },
      { status: 500 }
    );
  }
} 