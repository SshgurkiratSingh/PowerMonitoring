"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Container from "@/app/components/container";
import Heading from "@/app/components/Heading";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import { SafeUser } from "@/app/types";
import { CCMSDevice as PrismaCCMSDevice, TelemetryData, Schedule as PrismaSchedule, Alert as PrismaAlert, DeviceStatus, Location, SecurityConfig } from "@prisma/client";

// Interface for the device object as returned by GET /api/devices
interface DeviceFromAPI extends Omit<PrismaCCMSDevice, 'telemetry' | 'schedules' | 'alerts' | 'createdAt' | 'updatedAt'> {
  id: string;
  deviceId: string;
  status: DeviceStatus; // Use the enum for type safety, will be string at runtime
  alert: string | null;
  location: Location;
  security: SecurityConfig;
  telemetry: TelemetryData[]; // API includes latest telemetry as an array (possibly empty or with 1 item)
  // schedules and alerts are not included in the GET /api/devices list endpoint by default
  // If they were, they would be PrismaSchedule[] and PrismaAlert[] respectively.
  // For now, assume they are not part of the data for this page.
  createdAt: Date;
  updatedAt: Date;
}


const DevicesPage = () => {
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    axios.get<DeviceFromAPI[]>("/api/devices") // Expect a direct array of DeviceFromAPI
      .then((response) => {
        setDevices(response.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch devices:", err);
        setError(
          err.response?.data?.error || "Failed to load devices. Please try again later."
        );
        setDevices([]); // Clear devices on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <ClientOnly>
        <Container>
          <div className="pt-10 pb-20 flex justify-center items-center h-[60vh]">
            <Heading title="Loading Devices..." subtitle="Please wait while we fetch the device data." center />
            {/* Could add a spinner here */}
          </div>
        </Container>
      </ClientOnly>
    );
  }

  if (error) {
    return (
      <ClientOnly>
        <Container>
          <EmptyState title="Error Loading Devices" subtitle={error} />
        </Container>
      </ClientOnly>
    );
  }

  if (devices.length === 0) {
    return (
      <ClientOnly>
        <Container>
          <EmptyState
            title="No Devices Found"
            subtitle="There are currently no CCMS devices registered in the system."
            // Optionally, add a button to register a new device if an admin is viewing
            // showReset // This prop might not be suitable here
          />
        </Container>
      </ClientOnly>
    );
  }

  const handleDeviceClick = (deviceId: string) => {
    router.push(`/devices/${deviceId}`);
  };

  return (
    <ClientOnly>
      <Container>
        <div className="pt-10 pb-20">
          <Heading
            title="CCMS Devices"
            subtitle="List of all registered Centralized Control and Monitoring System panels."
          />
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => handleDeviceClick(device.id)} // Use database ID for navigation
                className="
                  col-span-1
                  cursor-pointer
                  group
                  p-4
                  border-[1px]
                  dark:border-neutral-700
                  rounded-xl
                  shadow-md
                  hover:shadow-lg
                  transition
                  bg-white
                  dark:bg-neutral-800
                  hover:border-neutral-400
                  dark:hover:border-neutral-500
                "
              >
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-semibold text-lg truncate text-neutral-700 dark:text-neutral-200">
                    Device ID: {device.deviceId}
                  </div>
                  <div className="font-light text-neutral-500 dark:text-neutral-400">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        device.status === "ONLINE" ? "text-green-500" :
                        device.status === "OFFLINE" ? "text-yellow-500" :
                        device.status === "FAULT" ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {device.status}
                    </span>
                  </div>
                  {device.alert && (
                    <div className="font-light text-sm text-red-600 dark:text-red-400 truncate" title={device.alert}>
                      Latest Alert: {device.alert}
                    </div>
                  )}
                  {device.telemetry && device.telemetry.length > 0 && (
                    <div className="font-light text-xs text-gray-500 dark:text-gray-400">
                      Last Update: {new Date(device.telemetry[0].timestamp).toLocaleString()}
                    </div>
                  )}
                   <div className="font-light text-xs text-gray-400 dark:text-gray-500 truncate">
                    DB ID: {device.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
};

export default DevicesPage;
