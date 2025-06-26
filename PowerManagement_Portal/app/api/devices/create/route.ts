import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const sudoPassword = request.headers.get('X-Sudo-Password');
    
    if (sudoPassword !== process.env.SUDOPASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized: Sudo access required' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.deviceId || !data.powerRating || !data.voltage || !data.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the device
    const device = await prisma.cCMSDevice.create({
      data: {
        deviceId: data.deviceId,
        powerRating: data.powerRating,
        voltage: data.voltage,
        frequency: data.frequency,
        incomingCurrent: data.incomingCurrent,
        ipRating: data.ipRating,
        location: data.location,
        status: 'ONLINE',
        alert: 'No active alerts',
      },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    );
  }
}