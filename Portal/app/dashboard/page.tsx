"use client"; // For potential future client-side interactions, hooks for data fetching, etc.

import React from "react";
import getCurrentUser from "@/app/actions/getCurrentUser"; // This is a server action, will need to adjust how it's called or make dashboard a server component.
import { redirect } from "next/navigation";
import Container from "@/app/components/container";
import Heading from "@/app/components/Heading";
import ClientOnly from "@/app/components/ClientOnly";
import prisma from "@/app/libs/prismadb"; // For direct DB access in Server Component
import MapPlaceholder from "@/app/components/MapPlaceholder"; // Import the placeholder
import { Location } from "@prisma/client"; // Import Location type

interface DeviceLocationInfo {
  id: string;
  deviceId: string;
  coordinates: [number, number];
  status: string;
  alert?: string | null;
}

// Making Dashboard a server component to use await getCurrentUser directly
export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  // Fetch devices data for the map directly in the server component
  let deviceLocations: DeviceLocationInfo[] = [];
  try {
    const devicesFromDb = await prisma.cCMSDevice.findMany({
      select: {
        id: true,
        deviceId: true,
        location: true, // Location is { coordinates: number[], address: string }
        status: true,
        alert: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // Ensure location and coordinates exist before mapping
    deviceLocations = devicesFromDb
      .filter(device => device.location && device.location.coordinates && device.location.coordinates.length === 2)
      .map(device => ({
        id: device.id,
        deviceId: device.deviceId,
        coordinates: [device.location!.coordinates[0], device.location!.coordinates[1]], // Lon, Lat
        status: device.status,
        alert: device.alert,
      }));
  } catch (error) {
    console.error("Failed to fetch device locations for map:", error);
    // Handle error appropriately, maybe pass an empty array or error message
  }

  // Dummy data for summary until API for aggregation is ready
  const summaryStats = {
    totalLights: deviceLocations.length, // Example: count of devices as total lights
    lightsOn: deviceLocations.filter(d => d.status === 'ONLINE').length, // Example
    lightsOff: deviceLocations.filter(d => d.status === 'OFFLINE' || d.status === 'FAULT').length, // Example
    alertsActive: deviceLocations.filter(d => d.alert != null && d.alert !== "").length,
  };

  // Fetch recent critical alerts for the dashboard
  let recentCriticalAlerts: any[] = [];
  try {
    // Note: In a server component, direct Prisma access is fine.
    // If this were client-side, we'd use fetch to /api/alerts.
    recentCriticalAlerts = await prisma.alert.findMany({
      where: {
        level: 'CRITICAL',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        device: {
          select: {
            deviceId: true, // User-friendly ID
            id: true,       // Database ID for linking
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch recent critical alerts for dashboard:", error);
  }


  return (
    <ClientOnly>
      <Container>
        <div className="pt-10 pb-20">
          <Heading
            title={`Welcome to your Dashboard, ${currentUser.name || "User"}!`}
            subtitle="Here's an overview of your CCMS system."
          />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Summary Statistics */}
            <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-neutral-800">
              <h3 className="text-xl font-semibold mb-2">Summary Statistics</h3>
              <p className="text-gray-600 dark:text-gray-300">Total Devices (Lights): {summaryStats.totalLights}</p>
              <p className="text-gray-600 dark:text-gray-300">Devices Online: {summaryStats.lightsOn}</p>
              <p className="text-gray-600 dark:text-gray-300">Devices Offline/Fault: {summaryStats.lightsOff}</p>
              <p className="text-gray-600 dark:text-gray-300">Active Device Alerts: {summaryStats.alertsActive}</p>
            </div>

            {/* Map Visualization */}
            <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-neutral-800 md:col-span-2">
              <h3 className="text-xl font-semibold mb-2">Device Map</h3>
              <MapPlaceholder devices={deviceLocations} />
            </div>

            {/* Placeholder for Quick Links */}
            <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-neutral-800">
              <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/devices" className="text-blue-500 hover:underline">View All Devices</a></li>
                <li><a href="/alerts" className="text-blue-500 hover:underline">View Alerts Log</a></li>
                {/* Add more links as features are developed, e.g., User Profile, Settings */}
                <li><a href="/Profile" className="text-blue-500 hover:underline">My Profile</a></li>
              </ul>
            </div>

            {/* Recent Critical Alerts */}
            <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-neutral-800 md:col-span-3">
              <h3 className="text-xl font-semibold mb-3">Recent Critical Alerts</h3>
              {recentCriticalAlerts.length > 0 ? (
                <ul className="space-y-2">
                  {recentCriticalAlerts.map((alert: any) => (
                    <li key={alert.id} className="p-3 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-700/50">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-red-700 dark:text-red-300">
                          Device: <a href={`/devices/${alert.device.id}`} className="hover:underline">{alert.device.deviceId}</a>
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 truncate" title={alert.message}>
                        {alert.message}
                      </p>
                    </li>
                  ))}
                   <li>
                    <a href="/alerts?level=CRITICAL" className="text-sm text-blue-500 hover:underline mt-2 inline-block">View all critical alerts...</a>
                    </li>
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No critical alerts in the recent history.</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
}
