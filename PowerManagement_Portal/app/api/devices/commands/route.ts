import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { CommandType, CommandStatus } from '@/types';

const prisma = new PrismaClient();

// POST - Send command to device(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceIds, groupId, commandType, value } = body;

    if (!commandType || !value) {
      return NextResponse.json(
        { error: 'Command type and value are required' },
        { status: 400 }
      );
    }

    if (!deviceIds && !groupId) {
      return NextResponse.json(
        { error: 'Either deviceIds or groupId must be provided' },
        { status: 400 }
      );
    }

    const commands: any[] = [];

    // If groupId is provided, get all devices in the group
    let targetDeviceIds = deviceIds;
    if (groupId) {
      const group = await prisma.deviceGroup.findUnique({
        where: { id: groupId },
        include: { devices: true },
      });

      if (!group) {
        return NextResponse.json(
          { error: 'Device group not found' },
          { status: 404 }
        );
      }

      targetDeviceIds = group.devices.map(device => device.id);
    }

    // Create commands for each device
    for (const deviceId of targetDeviceIds) {
      const command = await prisma.command.create({
        data: {
          deviceId,
          groupId,
          type: commandType as CommandType,
          value,
          status: CommandStatus.PENDING,
        },
      });

      commands.push(command);

      // Update device status based on command
      if (commandType === 'POWER_ON' || commandType === 'POWER_OFF') {
        await prisma.cCMSDevice.update({
          where: { id: deviceId },
          data: {
            isOn: commandType === 'POWER_ON',
            lastCommand: new Date(),
          },
        });
      }
    }

    // Simulate command execution (in real implementation, this would send to actual devices)
    setTimeout(async () => {
      for (const command of commands) {
        await prisma.command.update({
          where: { id: command.id },
          data: {
            status: CommandStatus.EXECUTED,
            executedAt: new Date(),
            response: `Command ${command.value} executed successfully`,
          },
        });
      }
    }, 1000);

    return NextResponse.json({ 
      commands,
      message: `Command ${value} sent to ${commands.length} device(s)`
    });
  } catch (error) {
    console.error('Error sending command:', error);
    return NextResponse.json(
      { error: 'Failed to send command' },
      { status: 500 }
    );
  }
}

// GET - Get command history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const groupId = searchParams.get('groupId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (deviceId) where.deviceId = deviceId;
    if (groupId) where.groupId = groupId;
    if (status) where.status = status;

    const commands = await prisma.command.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: limit,
      include: {
        device: {
          select: {
            deviceId: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ commands });
  } catch (error) {
    console.error('Error fetching commands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commands' },
      { status: 500 }
    );
  }
} 