"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
});

interface DeviceLocation {
  id: string;
  deviceId: string;
  status: "ONLINE" | "OFFLINE" | "FAULT";
  coordinates: [number, number];
  address: string;
  currentPower: number;
  temperature: number | null;
  lastUpdate: string | null;
  alertLevel: string | null;
  alertMessage: string | null;
}

interface LocationData {
  devices: DeviceLocation[];
  total: number;
  timestamp: string;
}

export default function MapPage() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<DeviceLocation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [alertFilter, setAlertFilter] = useState<string>("all");

  useEffect(() => {
    fetchLocationData();
    const interval = setInterval(fetchLocationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLocationData = async () => {
    try {
      const response = await fetch("/api/devices/locations");
      const data = await response.json();
      setLocationData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching location data:", error);
      setLoading(false);
    }
  };

  const filteredDevices = locationData?.devices?.filter(device => {
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    const matchesAlert = alertFilter === "all" || 
      (alertFilter === "none" && !device.alertLevel) ||
      (alertFilter === "critical" && device.alertLevel === "CRITICAL") ||
      (alertFilter === "warning" && device.alertLevel === "WARNING");
    return matchesStatus && matchesAlert;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "success";
      case "OFFLINE":
        return "default";
      case "FAULT":
        return "danger";
      default:
        return "default";
    }
  };

  const getAlertColor = (level: string | null) => {
    switch (level) {
      case "CRITICAL":
        return "danger";
      case "WARNING":
        return "warning";
      case "INFO":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusStats = () => {
    if (!locationData?.devices) return { online: 0, offline: 0, fault: 0, total: 0 };
    
    const devices = locationData.devices;
    return {
      online: devices.filter(d => d.status === "ONLINE").length,
      offline: devices.filter(d => d.status === "OFFLINE").length,
      fault: devices.filter(d => d.status === "FAULT").length,
      total: devices.length
    };
  };

  const getAlertStats = () => {
    if (!locationData?.devices) return { critical: 0, warning: 0, info: 0, total: 0 };
    
    const devices = locationData.devices;
    return {
      critical: devices.filter(d => d.alertLevel === "CRITICAL").length,
      warning: devices.filter(d => d.alertLevel === "WARNING").length,
      info: devices.filter(d => d.alertLevel === "INFO").length,
      total: devices.filter(d => d.alertLevel).length
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-[600px] bg-slate-800 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Map View</h1>
        <p className="text-slate-400">Interactive map showing all device locations and status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Total Devices</h3>
            <p className="text-3xl font-bold text-sky-400">{getStatusStats().total}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Online</h3>
            <p className="text-3xl font-bold text-green-400">{getStatusStats().online}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Fault</h3>
            <p className="text-3xl font-bold text-red-400">{getStatusStats().fault}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Alerts</h3>
            <p className="text-3xl font-bold text-orange-400">{getAlertStats().total}</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700 mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              placeholder="Filter by status"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
              className="bg-slate-800/50 border-slate-600"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="ONLINE">Online</SelectItem>
              <SelectItem key="OFFLINE">Offline</SelectItem>
              <SelectItem key="FAULT">Fault</SelectItem>
            </Select>
            <Select
              placeholder="Filter by alerts"
              selectedKeys={[alertFilter]}
              onSelectionChange={(keys) => setAlertFilter(Array.from(keys)[0] as string)}
              className="bg-slate-800/50 border-slate-600"
            >
              <SelectItem key="all">All Alerts</SelectItem>
              <SelectItem key="none">No Alerts</SelectItem>
              <SelectItem key="critical">Critical Only</SelectItem>
              <SelectItem key="warning">Warning Only</SelectItem>
            </Select>
            <Button
              color="primary"
              className="bg-gradient-to-r from-sky-500 to-blue-600"
              onClick={fetchLocationData}
            >
              Refresh Data
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Map and Device List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2 bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Device Locations</h3>
            <p className="text-sm text-slate-400">
              {filteredDevices.length} devices shown
            </p>
          </CardHeader>
          <CardBody>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <MapComponent />
            </div>
          </CardBody>
        </Card>

        {/* Device List */}
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Device List</h3>
            <p className="text-sm text-slate-400">
              Click to view details
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDevice?.id === device.id
                      ? "border-sky-500 bg-slate-800/50"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white text-sm">{device.deviceId}</h4>
                    <Chip
                      color={getStatusColor(device.status)}
                      variant="flat"
                      size="sm"
                    >
                      {device.status}
                    </Chip>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-2">{device.address}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300">
                      {device.currentPower.toFixed(1)} kW
                    </span>
                    {device.alertLevel && (
                      <Chip
                        color={getAlertColor(device.alertLevel)}
                        variant="flat"
                        size="sm"
                      >
                        {device.alertLevel}
                      </Chip>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredDevices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">No devices match your filters</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Selected Device Details */}
      {selectedDevice && (
        <Card className="mt-6 bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedDevice.deviceId}</h3>
                <p className="text-sm text-slate-400">{selectedDevice.address}</p>
              </div>
              <Button
                size="sm"
                variant="light"
                onClick={() => setSelectedDevice(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Status Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <Chip color={getStatusColor(selectedDevice.status)} variant="flat" size="sm">
                      {selectedDevice.status}
                    </Chip>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Power:</span>
                    <span className="text-white">{selectedDevice.currentPower.toFixed(1)} kW</span>
                  </div>
                  {selectedDevice.temperature && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Temperature:</span>
                      <span className="text-white">{selectedDevice.temperature.toFixed(1)}°C</span>
                    </div>
                  )}
                  {selectedDevice.lastUpdate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Update:</span>
                      <span className="text-white text-sm">
                        {new Date(selectedDevice.lastUpdate).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Location</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address:</span>
                    <span className="text-white text-sm">{selectedDevice.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="text-white text-sm">
                      {selectedDevice.coordinates[1].toFixed(4)}, {selectedDevice.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Alerts</h4>
                {selectedDevice.alertLevel ? (
                  <div className="space-y-2">
                    <Chip
                      color={getAlertColor(selectedDevice.alertLevel)}
                      variant="flat"
                      className="w-full justify-start"
                    >
                      {selectedDevice.alertMessage}
                    </Chip>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No active alerts</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
} 