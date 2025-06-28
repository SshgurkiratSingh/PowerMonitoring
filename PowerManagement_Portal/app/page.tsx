"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SudoModal } from "@/components/sudo-modal";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
});

interface DeviceStats {
  status: "ONLINE" | "OFFLINE" | "FAULT";
  _count: number;
}

interface DashboardData {
  deviceStats: DeviceStats[];
  latestAlerts: any[];
  totalPower: number;
  timestamp: string;
}

interface DeviceLocation {
  id: string;
  deviceId: string;
  status: "ONLINE" | "OFFLINE" | "FAULT";
  coordinates: [number, number];
  address: string;
  currentPower: number;
  alertLevel: string | null;
}

interface LocationData {
  devices: DeviceLocation[];
  total: number;
  timestamp: string;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSudoModal, setShowSudoModal] = useState(false);

  useEffect(() => {
    // Fetch both dashboard stats and location data
    const fetchAllData = async () => {
      try {
        const [statsResponse, locationResponse] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/devices/locations"),
        ]);

        const statsResult = await statsResponse.json();
        const locationResult = await locationResponse.json();

        console.log("✅ Home Stats:", statsResult);
        console.log("✅ Home Locations:", locationResult);

        setData(statsResult);
        setLocationData(locationResult);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchAllData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper functions to extract stats from deviceStats array
  const getTotalPanels = () => {
    if (!data?.deviceStats) return 0;
    return data.deviceStats.reduce((sum, stat) => sum + stat._count, 0);
  };

  const getOnlinePanels = () => {
    if (!data?.deviceStats) return 0;
    const onlineStat = data.deviceStats.find(
      (stat) => stat.status === "ONLINE"
    );
    return onlineStat?._count || 0;
  };

  const getOfflinePanels = () => {
    if (!data?.deviceStats) return 0;
    const offlineStat = data.deviceStats.find(
      (stat) => stat.status === "OFFLINE"
    );
    return offlineStat?._count || 0;
  };

  const getFaultPanels = () => {
    if (!data?.deviceStats) return 0;
    const faultStat = data.deviceStats.find((stat) => stat.status === "FAULT");
    return faultStat?._count || 0;
  };

  const getTotalPower = () => {
    return data?.totalPower || 0;
  };

  const getCriticalDevices = () => {
    if (!locationData?.devices) return 0;
    return locationData.devices.filter(
      (device) => device.alertLevel === "CRITICAL"
    ).length;
  };

  const handleEmergencyShutdown = () => {
    setShowSudoModal(true);
  };

  const handleSudoConfirm = async (success: boolean) => {
    if (success) {
      try {
        await fetch("/api/devices/emergency-shutdown", {
          method: "POST",
        });
        console.log("Emergency shutdown initiated");
      } catch (error) {
        console.error("Emergency shutdown failed:", error);
      }
    }
    setShowSudoModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="bg-slate-900/70 backdrop-blur-md border border-slate-700"
            >
              <CardBody>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Loading...
                </h3>
                <div className="w-16 h-8 bg-slate-700 animate-pulse rounded"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">
              Total Panels
            </h3>
            <p className="text-3xl font-bold text-sky-400">
              {getTotalPanels()}
            </p>
            <p className="text-xs text-slate-400 mt-1">All devices</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">
              Online Panels
            </h3>
            <p className="text-3xl font-bold text-green-400">
              {getOnlinePanels()}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {getTotalPanels() > 0
                ? `${((getOnlinePanels() / getTotalPanels()) * 100).toFixed(1)}% active`
                : "0% active"}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">
              Fault Panels
            </h3>
            <p className="text-3xl font-bold text-red-400">
              {getFaultPanels()}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {getFaultPanels() > 0 ? "Needs attention" : "All healthy"}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">
              Total Power
            </h3>
            <p className="text-3xl font-bold text-purple-400">
              {getTotalPower().toFixed(1)} kW
            </p>
            <p className="text-xs text-slate-400 mt-1">Live consumption</p>
          </CardBody>
        </Card>
      </div>

      {/* System Status and Map Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Map Devices:</span>
                <span className="text-white font-medium">
                  {locationData?.devices?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Critical Alerts:</span>
                <span className="text-red-400 font-medium">
                  {getCriticalDevices()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Last Update:</span>
                <span className="text-slate-300 text-xs">
                  {data?.timestamp
                    ? new Date(data.timestamp).toLocaleTimeString()
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    getFaultPanels() > 0
                      ? "bg-red-500"
                      : getOnlinePanels() > 0
                        ? "bg-green-500"
                        : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-white font-medium text-sm">
                  {getFaultPanels() > 0
                    ? "FAULT DETECTED"
                    : getOnlinePanels() > 0
                      ? "OPERATIONAL"
                      : "STANDBY"}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3 bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-4">
              Device Locations
            </h3>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <MapComponent />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
        <CardBody>
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              color="primary"
              className="bg-gradient-to-r from-sky-500 to-blue-600"
              isDisabled={getTotalPanels() === 0}
            >
              Schedule Update
            </Button>
            <Button
              color="warning"
              className="bg-gradient-to-r from-yellow-500 to-orange-600"
              isDisabled={getTotalPanels() === 0}
            >
              System Diagnostics
            </Button>
            <Button
              color="danger"
              className="bg-gradient-to-r from-red-500 to-rose-600"
              onClick={handleEmergencyShutdown}
              isDisabled={getOnlinePanels() === 0}
            >
              Emergency Shutdown
            </Button>
          </div>

          {/* Alert Summary */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <h4 className="text-md font-semibold text-white mb-2">
              Recent Activity
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <span className="text-slate-400">Total Alerts:</span>
                <p className="text-white font-medium">
                  {data?.latestAlerts?.length || 0}
                </p>
              </div>
              <div className="text-center">
                <span className="text-slate-400">Critical:</span>
                <p className="text-red-400 font-medium">
                  {data?.latestAlerts?.filter(
                    (alert) => alert.level === "CRITICAL"
                  )?.length || 0}
                </p>
              </div>
              <div className="text-center">
                <span className="text-slate-400">Warnings:</span>
                <p className="text-yellow-400 font-medium">
                  {data?.latestAlerts?.filter(
                    (alert) => alert.level === "WARNING"
                  )?.length || 0}
                </p>
              </div>
              <div className="text-center">
                <span className="text-slate-400">Map Coverage:</span>
                <p className="text-blue-400 font-medium">
                  {locationData?.devices?.length || 0}/{getTotalPanels()}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <SudoModal
        isOpen={showSudoModal}
        onClose={() => setShowSudoModal(false)}
        onConfirm={handleSudoConfirm}
      />
    </div>
  );
}
