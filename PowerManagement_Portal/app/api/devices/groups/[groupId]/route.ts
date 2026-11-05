import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { name, description, deviceIds } = await request.json();

    // Update the group
    const updatedGroup = await prisma.deviceGroup.update({
      where: { id: groupId },
      data: {
        name,
        description,
        updatedAt: new Date()
      }
    });

    // Update device associations if deviceIds are provided
    if (deviceIds && Array.isArray(deviceIds)) {
      // First, remove all current device associations
      await prisma.cCMSDevice.updateMany({
        where: { groupId },
        data: { groupId: null }
      });

      // Then add the new device associations
      if (deviceIds.length > 0) {
        await prisma.cCMSDevice.updateMany({
          where: { id: { in: deviceIds } },
          data: { groupId }
        });
      }
    }

    // Fetch the updated group with devices
    const groupWithDevices = await prisma.deviceGroup.findUnique({
      where: { id: groupId },
      include: {
        devices: {
          select: {
            id: true,
            deviceId: true,
            status: true,
            location: true
          }
        },
        _count: {
          select: {
            devices: true,
            schedules: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Group updated successfully',
      group: groupWithDevices
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
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

    // First, remove all device associations
    await prisma.cCMSDevice.updateMany({
      where: { groupId },
      data: { groupId: null }
    });

    // Then delete the group
    await prisma.deviceGroup.delete({
      where: { id: groupId }
    });

    return NextResponse.json({
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
} 