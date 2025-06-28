import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // First, let's regenerate Prisma types to fix any issues
    const devices = await prisma.cCMSDevice.findMany({
      select: {
        id: true,
        deviceId: true,
        status: true,
        location: true,
        powerRating: true,
        latestAlert: true,
        telemetry: true, // Since it's an embedded type, just select all
        // Remove alerts for now if it's causing issues, we'll add it back
      }
    });

    // Get alerts separately if the relation is problematic
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

    // Transform data for map display
    const deviceLocations = devices.map(device => {
      // Handle telemetry sorting in JavaScript since it's an embedded type
      let latestTelemetry = null;
      if (device.telemetry && Array.isArray(device.telemetry) && device.telemetry.length > 0) {
        // Sort telemetry by timestamp to get the latest
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
        coordinates: device.location.coordinates, // [longitude, latitude]
        address: device.location.address,
        powerRating: device.powerRating,
        latestAlert: device.latestAlert,
        currentPower: totalPower,
        temperature: latestTelemetry?.temperature || null,
        lastUpdate: latestTelemetry?.timestamp || null,
        alertLevel: latestAlert?.level || null,
        alertMessage: latestAlert?.message || null,
        alertTime: latestAlert?.createdAt || null
      };
    });

    return NextResponse.json({
      devices: deviceLocations,
      total: deviceLocations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching device locations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch device locations',
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
    const { deviceId, coordinates, address } = await request.json();

    // Validate input
    if (!deviceId || !coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid input. DeviceId and coordinates [lng, lat] are required.' },
        { status: 400 }
      );
    }

    // Update device location
    const updatedDevice = await prisma.cCMSDevice.update({
      where: { deviceId },
      data: {
        location: {
          coordinates,
          address: address || 'Unknown Location'
        }
      },
      select: {
        id: true,
        deviceId: true,
        location: true
      }
    });

    return NextResponse.json({
      message: 'Device location updated successfully',
      device: updatedDevice
    });

  } catch (error) {
    console.error('Error updating device location:', error);
    return NextResponse.json(
      { error: 'Failed to update device location' },
      { status: 500 }
    );
  }
}
