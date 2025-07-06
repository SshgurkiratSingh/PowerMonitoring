import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { DashboardStats, FleetOverview, EnergyAnalytics } from '@/types';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all devices
    const devices = await prisma.cCMSDevice.findMany({
      include: {
        deviceGroup: true,
        alertThresholds: true,
      },
    });

    // Get latest alerts
    const latestAlerts = await prisma.alert.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isAcknowledged: false,
      },
      select: {
        id: true,
        message: true,
        level: true,
        type: true,
        value: true,
        threshold: true,
        createdAt: true,
        device: {
          select: {
            deviceId: true,
          },
        },
      },
    });

    // Get device groups count
    const deviceGroups = await prisma.deviceGroup.count();

    // Get active schedules count
    const activeSchedules = await prisma.schedule.count({
      where: {
        isActive: true,
      },
    });

    // Calculate device stats manually
    const deviceStats = [
      { status: 'ONLINE', _count: devices.filter(d => d.status === 'ONLINE').length },
      { status: 'OFFLINE', _count: devices.filter(d => d.status === 'OFFLINE').length },
      { status: 'FAULT', _count: devices.filter(d => d.status === 'FAULT').length },
      { status: 'MAINTENANCE', _count: devices.filter(d => d.status === 'MAINTENANCE').length },
    ];

    // Get status counts
    const onlineDevices = deviceStats.find(stat => stat.status === 'ONLINE')?._count || 0;
    const offlineDevices = deviceStats.find(stat => stat.status === 'OFFLINE')?._count || 0;
    const faultDevices = deviceStats.find(stat => stat.status === 'FAULT')?._count || 0;
    const maintenanceDevices = deviceStats.find(stat => stat.status === 'MAINTENANCE')?._count || 0;

    // Calculate total power consumption and energy from real telemetry data
    let totalPower = 0;
    let totalEnergyConsumption = 0;
    let devicesWithTelemetry = 0;
    
    devices.forEach(device => {
      if (device.telemetry && device.telemetry.length > 0) {
        const latestTelemetry = device.telemetry[device.telemetry.length - 1]; // Get the most recent telemetry
        totalPower += latestTelemetry.totalPower || 0;
        totalEnergyConsumption += latestTelemetry.totalEnergy || 0;
        devicesWithTelemetry++;
      }
    });

    // Calculate network health percentage
    const totalDevices = devices.length;
    const networkHealthPercentage = totalDevices > 0 ? (onlineDevices / totalDevices) * 100 : 0;

    // Calculate critical alerts
    const criticalAlerts = latestAlerts.filter(alert => 
      alert.level === 'CRITICAL' || alert.level === 'EMERGENCY'
    ).length;

    // Create enhanced dashboard stats
    const dashboardStats: DashboardStats = {
      totalDevices,
      onlineDevices,
      offlineDevices,
      faultDevices,
      maintenanceDevices,
      totalPower: Math.round(totalPower * 100) / 100,
      totalEnergy: Math.round(totalEnergyConsumption * 100) / 100,
      activeAlerts: latestAlerts.length,
      criticalAlerts,
      deviceGroups,
      activeSchedules,
      networkHealth: Math.round(networkHealthPercentage * 100) / 100,
      timestamp: new Date(),
    };

    // Create fleet overview with real data
    const fleetOverview: FleetOverview = {
      totalPanels: totalDevices,
      totalFeeders: Math.ceil(totalDevices / 10), // Estimate feeders based on devices
      totalLights: totalDevices * 4, // Estimate 4 lights per panel
      onlinePercentage: totalDevices > 0 ? (onlineDevices / totalDevices) * 100 : 0,
      networkHealth: networkHealthPercentage,
      powerConsumption: totalPower,
      energySavings: totalEnergyConsumption * 0.15, // Estimate 15% energy savings based on real consumption
      lastUpdate: new Date(),
    };

    // Create energy analytics from real telemetry data
    const energyAnalytics: EnergyAnalytics = {
      currentPower: totalPower,
      totalEnergy: totalEnergyConsumption,
      voltage: devicesWithTelemetry > 0 ? devices.reduce((acc, device) => {
        if (device.telemetry && device.telemetry.length > 0) {
          const latestTelemetry = device.telemetry[device.telemetry.length - 1];
          return [
            acc[0] + (latestTelemetry.voltage?.[0] || 0),
            acc[1] + (latestTelemetry.voltage?.[1] || 0),
            acc[2] + (latestTelemetry.voltage?.[2] || 0)
          ];
        }
        return acc;
      }, [0, 0, 0]).map(sum => sum / devicesWithTelemetry) : [0, 0, 0],
      current: devicesWithTelemetry > 0 ? devices.reduce((acc, device) => {
        if (device.telemetry && device.telemetry.length > 0) {
          const latestTelemetry = device.telemetry[device.telemetry.length - 1];
          return [
            acc[0] + (latestTelemetry.current?.[0] || 0),
            acc[1] + (latestTelemetry.current?.[1] || 0),
            acc[2] + (latestTelemetry.current?.[2] || 0)
          ];
        }
        return acc;
      }, [0, 0, 0]).map(sum => sum / devicesWithTelemetry) : [0, 0, 0],
      powerFactor: devicesWithTelemetry > 0 ? devices.reduce((acc, device) => {
        if (device.telemetry && device.telemetry.length > 0) {
          const latestTelemetry = device.telemetry[device.telemetry.length - 1];
          return [
            acc[0] + (latestTelemetry.powerFactor?.[0] || 0),
            acc[1] + (latestTelemetry.powerFactor?.[1] || 0),
            acc[2] + (latestTelemetry.powerFactor?.[2] || 0)
          ];
        }
        return acc;
      }, [0, 0, 0]).map(sum => sum / devicesWithTelemetry) : [0, 0, 0],
      temperature: devicesWithTelemetry > 0 ? devices.reduce((acc, device) => {
        if (device.telemetry && device.telemetry.length > 0) {
          return acc + (device.telemetry[device.telemetry.length - 1].temperature || 0);
        }
        return acc;
      }, 0) / devicesWithTelemetry : 0,
      frequency: devicesWithTelemetry > 0 ? devices.reduce((acc, device) => {
        if (device.telemetry && device.telemetry.length > 0) {
          return acc + (device.telemetry[device.telemetry.length - 1].frequency || 0);
        }
        return acc;
      }, 0) / devicesWithTelemetry : 0,
      phaseStatus: devicesWithTelemetry > 0 ? devices.reduce((acc: boolean[], device) => {
        if (device.telemetry && device.telemetry.length > 0) {
          const latestTelemetry = device.telemetry[device.telemetry.length - 1];
          return [
            acc[0] && (latestTelemetry.phaseStatus?.[0] ?? false),
            acc[1] && (latestTelemetry.phaseStatus?.[1] ?? false),
            acc[2] && (latestTelemetry.phaseStatus?.[2] ?? false)
          ];
        }
        return acc;
      }, [true, true, true]) : [false, false, false],
      timestamp: new Date(),
    };

    // Ensure all status types are represented
    const allStatuses = ['ONLINE', 'OFFLINE', 'FAULT', 'MAINTENANCE'];
    const completeDeviceStats = allStatuses.map(status => {
      const existing = deviceStats.find(stat => stat.status === status);
      return existing || { status, _count: 0 };
    });

    const response = {
      deviceStats: completeDeviceStats,
      latestAlerts,
      totalPower: Math.round(totalPower * 100) / 100,
      timestamp: new Date().toISOString(),
      dashboardStats,
      fleetOverview,
      energyAnalytics,
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
          { status: 'MAINTENANCE', _count: 0 },
        ],
        latestAlerts: [],
        totalPower: 0,
        timestamp: new Date().toISOString(),
        dashboardStats: {
          totalDevices: 0,
          onlineDevices: 0,
          offlineDevices: 0,
          faultDevices: 0,
          maintenanceDevices: 0,
          totalPower: 0,
          totalEnergy: 0,
          activeAlerts: 0,
          criticalAlerts: 0,
          deviceGroups: 0,
          activeSchedules: 0,
          networkHealth: 0,
          timestamp: new Date(),
        },
        fleetOverview: {
          totalPanels: 0,
          totalFeeders: 0,
          totalLights: 0,
          onlinePercentage: 0,
          networkHealth: 0,
          powerConsumption: 0,
          energySavings: 0,
          lastUpdate: new Date(),
        },
        energyAnalytics: {
          currentPower: 0,
          totalEnergy: 0,
          voltage: [0, 0, 0],
          current: [0, 0, 0],
          powerFactor: [0, 0, 0],
          temperature: 0,
          frequency: 0,
          phaseStatus: [false, false, false],
          timestamp: new Date(),
        },
        error: 'Failed to fetch dashboard stats'
      },
      { status: 500 }
    );
  }
}
