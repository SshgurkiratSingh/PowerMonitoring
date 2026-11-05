import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;

    // Check if device exists
    const device = await prisma.cCMSDevice.findUnique({
      where: { deviceId },
      include: {
        schedules: {
          where: {
            endTime: {
              gte: new Date() // Only get active/future schedules
            }
          },
          orderBy: { startTime: 'asc' }
        },
        alerts: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Default system settings (can be extended later with a proper settings table)
    const systemSettings = {
      maintenanceMode: false,
      globalScheduleEnabled: true,
      alertThresholds: {
        temperature: 60,
        powerFactor: 0.8,
        voltage: { min: 200, max: 250 }
      }
    };

    // Prepare response with device-specific data
    const response = {
      deviceId: device.deviceId,
      status: device.status,
      lastUpdate: device.updatedAt,
      schedules: device.schedules.map(schedule => ({
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        mode: schedule.mode
      })),
      recentAlerts: device.alerts.map(alert => ({
        id: alert.id,
        message: alert.message,
        level: alert.level,
        timestamp: alert.createdAt
      })),
      deviceConfig: {
        powerRating: device.powerRating,
        voltage: device.voltage,
        frequency: device.frequency,
        incomingCurrent: device.incomingCurrent,
        ipRating: device.ipRating,
        location: device.location
      },
      systemSettings: systemSettings,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching device updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device updates' },
      { status: 500 }
    );
  }
}

// POST endpoint for devices to acknowledge updates
export async function POST(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;
    const body = await request.json();
    const { acknowledgedSchedules, acknowledgedAlerts, deviceStatus } = body;

    // Update device status if provided
    if (deviceStatus) {
      await prisma.cCMSDevice.update({
        where: { deviceId },
        data: {
          status: deviceStatus,
          updatedAt: new Date()
        }
      });
    }

    // Log the acknowledgment (you might want to create a separate table for this)
    console.log(`Device ${deviceId} acknowledged updates:`, {
      acknowledgedSchedules,
      acknowledgedAlerts,
      deviceStatus,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Updates acknowledged successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error acknowledging device updates:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge updates' },
      { status: 500 }
    );
  }
} 