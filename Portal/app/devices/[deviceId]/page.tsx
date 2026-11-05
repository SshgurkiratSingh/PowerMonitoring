"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Container from "@/app/components/container";
import Heading from "@/app/components/Heading";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import TelemetryCharts from "@/app/components/devices/TelemetryCharts";
import ScheduleManager from "@/app/components/devices/ScheduleManager";
import ManualControls from "@/app/components/devices/ManualControls";
import AlertHistory from "@/app/components/devices/AlertHistory"; // Import AlertHistory
import toast from 'react-hot-toast';
import {
  CCMSDevice as PrismaCCMSDevice,
  TelemetryData,
  Schedule as PrismaSchedule,
  Alert as PrismaAlert,
  DeviceStatus,
  Location,
  SecurityConfig
} from "@prisma/client";

// Type for the detailed device data fetched from API
interface DetailedDevice extends Omit<PrismaCCMSDevice, 'createdAt' | 'updatedAt' | 'telemetry' | 'schedules' | 'alerts'> {
  createdAt: string; // Assuming API formats dates as strings, or use Date and format in component
  updatedAt: string;
  telemetry: TelemetryData[];
  schedules: PrismaSchedule[];
  alerts: PrismaAlert[];
  // Location and SecurityConfig are nested objects in PrismaCCMSDevice, so they are included.
}

const DeviceDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const deviceDbId = params?.deviceId as string; // This is the database ID from the URL

  const [device, setDevice] = useState<DetailedDevice | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); // Renamed to avoid conflict
  const [error, setError] = useState<string | null>(null);

  const fetchDeviceData = () => {
    if (!deviceDbId) {
      setIsLoadingInitial(false);
      setError("Device ID not found in URL.");
      return;
    }
    setIsLoadingInitial(true);
    axios.get(`/api/devices/${deviceDbId}`)
      .then((response) => {
        const fetchedDevice = response.data as any;
        fetchedDevice.createdAt = new Date(fetchedDevice.createdAt).toLocaleString();
        fetchedDevice.updatedAt = new Date(fetchedDevice.updatedAt).toLocaleString();
        fetchedDevice.telemetry = fetchedDevice.telemetry || [];
        fetchedDevice.schedules = fetchedDevice.schedules || [];
        fetchedDevice.alerts = fetchedDevice.alerts || [];
        setDevice(fetchedDevice);
        setError(null);
      })
      .catch((err) => {
        console.error(`Failed to fetch device ${deviceDbId}:`, err);
        setError(
          err.response?.data?.error || `Failed to load device data. Please try again later.`
        );
        setDevice(null);
      })
      .finally(() => {
        setIsLoadingInitial(false);
      });
  };

  useEffect(() => {
    fetchDeviceData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceDbId]); // Only re-run if deviceDbId changes

  const handleScheduleUpdate = () => {
    // This will re-fetch the device data, including updated schedules
    // Alternatively, can use router.refresh() if server components are set up for that,
    // but for client components managing their own state, direct re-fetch is often clearer.
    toast.success("Refreshing schedules...");
    fetchDeviceData();
  };


  if (isLoadingInitial) {
    return (
      <ClientOnly>
        <Container>
          <div className="pt-10 pb-20 flex justify-center items-center h-[60vh]">
            <Heading title="Loading Device Details..." subtitle="Fetching all the data for your device." center />
          </div>
        </Container>
      </ClientOnly>
    );
  }

  if (error) {
    return (
      <ClientOnly>
        <Container>
          <EmptyState title="Error Loading Device" subtitle={error} showReset onClick={() => router.push('/devices')} />
        </Container>
      </ClientOnly>
    );
  }

  if (!device) {
    return (
      <ClientOnly>
        <Container>
          <EmptyState title="Device Not Found" subtitle="No data found for the specified device ID." showReset onClick={() => router.push('/devices')} />
        </Container>
      </ClientOnly>
    );
  }

  const renderLocation = (location: Location | undefined | null) => {
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
        return <p>Coordinates or address not available.</p>;
    }
    return (
        <>
            <p><strong>Address:</strong> {location.address || "N/A"}</p>
            <p><strong>Coordinates:</strong> [{location.coordinates[1].toFixed(4)}, {location.coordinates[0].toFixed(4)}] (Lat, Lon)</p>
        </>
    );
  };

  const renderSecurityConfig = (security: SecurityConfig | undefined | null) => {
    if (!security) return <p>Not available</p>;
    return (
        <>
            <p><strong>Tamper Sensor:</strong> {security.tamperSensor ? "Enabled" : "Disabled"}</p>
            <p><strong>Password Level 1:</strong> {security.passwordLevel1 ? 'Set' : 'Not Set'}</p>
            <p><strong>Password Level 2:</strong> {security.passwordLevel2 ? 'Set' : 'Not Set'}</p>
        </>
    );
  };


  return (
    <ClientOnly>
      <Container>
        <div className="max-w-4xl mx-auto py-10">
          <Heading title={`Device Details: ${device.deviceId}`} subtitle={`Database ID: ${device.id}`} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white dark:bg-neutral-800 p-6 shadow-lg rounded-lg">

            {/* Column 1: Basic Info */}
            <div className="space-y-3">
              <div><h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">General Information</h3></div>
              <p><strong>Power Rating:</strong> {device.powerRating || "N/A"}</p>
              <p><strong>Voltage:</strong> {device.voltage || "N/A"}</p>
              <p><strong>Frequency:</strong> {device.frequency || "N/A"}</p>
              <p><strong>Incoming Current:</strong> {device.incomingCurrent || "N/A"}</p>
              <p><strong>IP Rating:</strong> {device.ipRating || "N/A"}</p>
              <p>
                <strong>Status:</strong>
                <span className={`ml-2 font-semibold ${
                    device.status === "ONLINE" ? "text-green-500" :
                    device.status === "OFFLINE" ? "text-yellow-500" :
                    device.status === "FAULT" ? "text-red-500" : "text-gray-500"
                }`}>
                    {device.status}
                </span>
              </p>
              {device.alert && (
                <p className="text-red-600 dark:text-red-400"><strong>Latest Alert:</strong> {device.alert}</p>
              )}
            </div>

            {/* Column 2: Location & Security */}
            <div className="space-y-3">
              <div><h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">Location</h3></div>
              {renderLocation(device.location)}

              <div className="pt-4"><h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">Security Configuration</h3></div>
              {renderSecurityConfig(device.security)}
            </div>

            <div className="md:col-span-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                <p><strong>Created At:</strong> {device.createdAt}</p>
                <p><strong>Last Updated:</strong> {device.updatedAt}</p>
            </div>
          </div>

          {/* Placeholder sections for Telemetry, Schedules, Alerts History - to be filled in next steps */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Telemetry Data</h2>
            {device.telemetry && device.telemetry.length > 0 ? (
              <TelemetryCharts telemetry={device.telemetry} />
            ) : (
              <div className="p-6 bg-white dark:bg-neutral-800 shadow-lg rounded-lg min-h-[100px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No telemetry data recorded for this device.</p>
              </div>
            )}
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Manage Schedules</h2>
            {device.schedules ? (
                <ScheduleManager
                    deviceId={device.id}
                    schedules={device.schedules}
                    onScheduleUpdate={handleScheduleUpdate}
                />
            ) : (
              <div className="p-6 bg-white dark:bg-neutral-800 shadow-lg rounded-lg min-h-[100px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Loading schedules or no schedules available...</p>
              </div>
            )}
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Manual Controls</h2>
            <ManualControls deviceId={device.id} deviceUniqueId={device.deviceId} />
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Alert History</h2>
            {device.alerts ? (
              <AlertHistory alerts={device.alerts} />
            ) : (
              <div className="p-6 bg-white dark:bg-neutral-800 shadow-lg rounded-lg min-h-[100px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Loading alert history or no alerts available...</p>
              </div>
            )}
          </div>

        </div>
      </Container>
    </ClientOnly>
  );
};

export default DeviceDetailPage;
