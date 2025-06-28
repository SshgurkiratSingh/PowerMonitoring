import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [deviceStatsRaw, latestAlerts, devices] = await prisma.$transaction([
      // Get device status counts
      prisma.cCMSDevice.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
        orderBy: {
          status: 'asc',
        },
      }),
      // Get latest alerts (this will be empty based on your image)
      prisma.alert.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          message: true,
          level: true,
          createdAt: true,
          device: {
            select: {
              deviceId: true,
            },
          },
        },
      }),
      // Get all devices with their telemetry data
      prisma.cCMSDevice.findMany({
        select: {
          deviceId: true,
          telemetry: true,
          latestAlert: true, // Include latestAlert for fallback
          status: true,
        },
      }),
    ]);

    // Transform device stats to the expected structure
    const deviceStats = deviceStatsRaw.map(stat => ({
      status: stat.status,
      _count: typeof stat._count === 'object' && stat._count !== null && '_all' in stat._count
        ? (stat._count as { _all?: number })._all ?? 0
        : 0,
    }));

    // If no Alert records exist, create alerts from latestAlert field
    let alertsToReturn = latestAlerts;
    if (latestAlerts.length === 0) {
      alertsToReturn = devices
        .filter(device => device.latestAlert && device.latestAlert.trim() !== '')
        .slice(0, 5)
        .map((device, index) => ({
          id: `fallback-${index}`,
          message: device.latestAlert,
          level: 'INFO', // Default level since we don't have it in latestAlert
          createdAt: new Date(),
          device: {
            deviceId: device.deviceId,
          },
        }));
    }

    // Calculate total power consumption
    const totalPower = devices.reduce((sum, device) => {
      if (device.telemetry && device.telemetry.length > 0) {
        const sortedTelemetry = device.telemetry.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        const latestReading = sortedTelemetry[0];
        
        if (latestReading && Array.isArray(latestReading.power) && latestReading.power.length > 0) {
          const validPowerValues = latestReading.power.filter(p => typeof p === 'number' && !isNaN(p));
          return sum + validPowerValues.reduce((a, b) => a + b, 0);
        }
      }
      return sum;
    }, 0);

    // Ensure all status types are represented
    const allStatuses = ['ONLINE', 'OFFLINE', 'FAULT'];
    const completeDeviceStats = allStatuses.map(status => {
      const existing = deviceStats.find(stat => stat.status === status);
      return existing || { status, _count: 0 };
    });

    const response = {
      deviceStats: completeDeviceStats,
      latestAlerts: alertsToReturn,
      totalPower: Math.round(totalPower * 100) / 100, // Round to 2 decimal places
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    return NextResponse.json(
      {
        deviceStats: [
          { status: 'ONLINE', _count: 0 },
          { status: 'OFFLINE', _count: 0 },
          { status: 'FAULT', _count: 0 },
        ],
        latestAlerts: [],
        totalPower: 0,
        timestamp: new Date().toISOString(),
        error: 'Failed to fetch dashboard stats'
      },
      { status: 500 }
    );
  }
}
