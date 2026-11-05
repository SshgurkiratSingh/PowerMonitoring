"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { useState, useEffect } from "react";

interface Alert {
  id: string;
  deviceId: string;
  device: {
    deviceId: string;
    location: {
      address: string;
    };
  };
  message: string;
  level: "INFO" | "WARNING" | "CRITICAL";
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [devices, setDevices] = useState<{id: string, deviceId: string}[]>([]);

  useEffect(() => {
    fetchAlerts();
    fetchDevices();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts");
      const data = await response.json();
      setAlerts(data.alerts || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices");
      const data = await response.json();
      setDevices(data.devices?.map((d: any) => ({id: d.id, deviceId: d.deviceId})) || []);
    } catch {}
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesLevel = levelFilter === "all" || alert.level === levelFilter;
    const matchesDevice = deviceFilter === "all" || alert.deviceId === deviceFilter;
    return matchesLevel && matchesDevice;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "danger";
      case "WARNING": return "warning";
      case "INFO": return "primary";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
              <CardBody>
                <div className="w-full h-32 bg-slate-700 animate-pulse rounded"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
        <p className="text-slate-400">View and filter all device alerts</p>
      </div>
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700 mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              placeholder="Filter by level"
              selectedKeys={[levelFilter]}
              onSelectionChange={(keys) => setLevelFilter(Array.from(keys)[0] as string)}
              className="bg-slate-800/50 border-slate-600"
            >
              <SelectItem key="all">All Levels</SelectItem>
              <SelectItem key="CRITICAL">Critical</SelectItem>
              <SelectItem key="WARNING">Warning</SelectItem>
              <SelectItem key="INFO">Info</SelectItem>
            </Select>
            <Select
              placeholder="Filter by device"
              selectedKeys={[deviceFilter]}
              onSelectionChange={(keys) => setDeviceFilter(Array.from(keys)[0] as string)}
              className="bg-slate-800/50 border-slate-600"
            >
              <SelectItem key="all">All Devices</SelectItem>
              {devices.map(device => (
                <SelectItem key={device.id}>{device.deviceId}</SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlerts.map(alert => (
          <Card key={alert.id} className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
            <CardHeader className="pb-2 flex justify-between items-center">
              <span className="font-semibold text-white">{alert.device?.deviceId || alert.deviceId}</span>
              <Chip color={getLevelColor(alert.level)} variant="flat" size="sm">{alert.level}</Chip>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="space-y-2">
                <p className="text-slate-300 text-sm">{alert.message}</p>
                <p className="text-xs text-slate-400">{alert.device?.location?.address}</p>
                <p className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
            </CardBody>
          </Card>
        ))}
        {filteredAlerts.length === 0 && (
          <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
            <CardBody className="text-center py-12">
              <p className="text-slate-400">No alerts found matching your criteria</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
} 