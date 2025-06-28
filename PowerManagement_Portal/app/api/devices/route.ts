import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const devices = await prisma.cCMSDevice.findMany({
      select: {
        id: true,
        deviceId: true,
        status: true,
        location: true,
        powerRating: true,
        voltage: true,
        frequency: true,
        incomingCurrent: true,
        ipRating: true,
        telemetry: true,
        latestAlert: true,
      }
    });

    // Get alerts separately
    const deviceIds = devices.map(device => device.id);
    const latestAlerts = await prisma.alert.findMany({
      where: {
        deviceId: {
          in: deviceIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group alerts by deviceId and get the latest one for each device
    const alertsByDevice = latestAlerts.reduce((acc, alert) => {
      if (!acc[alert.deviceId]) {
        acc[alert.deviceId] = alert;
      }
      return acc;
    }, {} as Record<string, any>);

    // Transform data for frontend
    const transformedDevices = devices.map(device => {
      // Get latest telemetry
      let latestTelemetry = null;
      if (device.telemetry && Array.isArray(device.telemetry) && device.telemetry.length > 0) {
        const sortedTelemetry = [...device.telemetry].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        latestTelemetry = sortedTelemetry[0];
      }

      const latestAlert = alertsByDevice[device.id];
      
      // Calculate total power from latest telemetry
      const totalPower = latestTelemetry?.power 
        ? latestTelemetry.power.reduce((sum, p) => sum + (p || 0), 0)
        : 0;

      return {
        id: device.id,
        deviceId: device.deviceId,
        status: device.status,
        location: device.location,
        powerRating: device.powerRating,
        voltage: device.voltage,
        frequency: device.frequency,
        incomingCurrent: device.incomingCurrent,
        ipRating: device.ipRating,
        currentPower: totalPower,
        temperature: latestTelemetry?.temperature || null,
        lastUpdate: latestTelemetry?.timestamp || null,
        alertLevel: latestAlert?.level || null,
        alertMessage: latestAlert?.message || null,
        alertTime: latestAlert?.createdAt || null
      };
    });

    return NextResponse.json({
      devices: transformedDevices,
      total: transformedDevices.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch devices',
        devices: [],
        total: 0,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { deviceId, powerRating, voltage, frequency, incomingCurrent, ipRating, coordinates, address } = await request.json();

    // Validate required fields
    if (!deviceId || !powerRating || !voltage || !frequency || !incomingCurrent || !ipRating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new device
    const newDevice = await prisma.cCMSDevice.create({
      data: {
        deviceId,
        powerRating,
        voltage,
        frequency,
        incomingCurrent,
        ipRating,
        location: {
          coordinates: coordinates || [0, 0],
          address: address || 'Unknown Location'
        },
        status: 'OFFLINE',
        telemetry: [],
        latestAlert: ''
      },
      select: {
        id: true,
        deviceId: true,
        status: true,
        location: true,
        powerRating: true,
        voltage: true,
        frequency: true,
        incomingCurrent: true,
        ipRating: true
      }
    });

    return NextResponse.json({
      message: 'Device created successfully',
      device: newDevice
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    );
  }
} 