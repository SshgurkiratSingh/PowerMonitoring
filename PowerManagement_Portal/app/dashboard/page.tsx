"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Divider,
  Spinner,
  Progress,
  Badge,
} from "@heroui/react";
import {
  MdPower,
  MdWarning,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdRefresh,
  MdDevices,
  MdSignalWifiStatusbar4Bar,
  MdSignalWifiOff,
  MdError,
  MdNotifications,
  MdDashboard,
  MdBolt,
  MdTrendingUp,
  MdSchedule,
} from "react-icons/md";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { IoStatsChart, IoHardwareChip, IoAlert } from "react-icons/io5";

interface DeviceStats {
  status: "ONLINE" | "OFFLINE" | "FAULT";
  _count: number;
}

interface LatestAlert {
  id: string;
  message: string;
  level: "INFO" | "WARNING" | "CRITICAL";
  createdAt: string;
  device: {
    deviceId: string;
  };
}

interface DashboardData {
  deviceStats: DeviceStats[];
  latestAlerts: LatestAlert[];
  totalPower: number;
  timestamp: string;
  error?: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      if (!loading) setRefreshing(true);
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const result = await response.json();
      console.log("Dashboard data received:", result); // Debug log
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err); // Debug log
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ONLINE":
        return {
          color: "success" as const,
          icon: <MdSignalWifiStatusbar4Bar className="w-5 h-5" />,
          variant: "flat" as const,
          bgColor: "bg-success-100",
          textColor: "text-success-700",
        };
      case "OFFLINE":
        return {
          color: "default" as const,
          icon: <MdSignalWifiOff className="w-5 h-5" />,
          variant: "flat" as const,
          bgColor: "bg-default-100",
          textColor: "text-default-700",
        };
      case "FAULT":
        return {
          color: "danger" as const,
          icon: <MdError className="w-5 h-5" />,
          variant: "flat" as const,
          bgColor: "bg-danger-100",
          textColor: "text-danger-700",
        };
      default:
        return {
          color: "default" as const,
          icon: <MdCancel className="w-5 h-5" />,
          variant: "flat" as const,
          bgColor: "bg-default-100",
          textColor: "text-default-700",
        };
    }
  };

  const getAlertConfig = (level: string) => {
    switch (level) {
      case "INFO":
        return {
          color: "primary" as const,
          variant: "bordered" as const,
          icon: <FaInfoCircle className="w-4 h-4" />,
          borderColor: "border-l-primary",
        };
      case "WARNING":
        return {
          color: "warning" as const,
          variant: "bordered" as const,
          icon: <FaExclamationTriangle className="w-4 h-4" />,
          borderColor: "border-l-warning",
        };
      case "CRITICAL":
        return {
          color: "danger" as const,
          variant: "bordered" as const,
          icon: <MdError className="w-4 h-4" />,
          borderColor: "border-l-danger",
        };
      default:
        return {
          color: "default" as const,
          variant: "bordered" as const,
          icon: <IoAlert className="w-4 h-4" />,
          borderColor: "border-l-default",
        };
    }
  };

  const getTotalDevices = () => {
    return data?.deviceStats?.reduce((sum, stat) => sum + stat._count, 0) || 0;
  };

  const getActiveDevices = () => {
    return (
      data?.deviceStats?.find((stat) => stat.status === "ONLINE")?._count || 0
    );
  };

  const getCriticalAlerts = () => {
    return (
      data?.latestAlerts?.filter((alert) => alert.level === "CRITICAL")
        ?.length || 0
    );
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-danger-200 bg-danger-50">
          <CardBody>
            <div className="flex items-center space-x-3">
              <MdWarning className="w-6 h-6 text-danger" />
              <div>
                <h3 className="text-lg font-semibold text-danger">
                  Error Loading Dashboard
                </h3>
                <p className="text-danger-600">{error}</p>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Button color="danger" variant="light" onPress={fetchDashboardData}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <MdDashboard className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              CCMS Dashboard
            </h1>
            <div className="flex items-center space-x-1 text-default-500 mt-1">
              <MdAccessTime className="w-4 h-4" />
              <span className="text-sm">
                Last updated:{" "}
                {data?.timestamp
                  ? new Date(data.timestamp).toLocaleString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>
        <Button
          color="primary"
          variant="flat"
          onPress={fetchDashboardData}
          isLoading={refreshing}
          startContent={!refreshing && <MdRefresh className="w-4 h-4" />}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Power Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdBolt className="w-6 h-6" />
              <span className="text-sm font-medium">Total Power</span>
            </div>
            <MdTrendingUp className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">
              {data?.totalPower?.toFixed(1) || 0} kW
            </div>
            <Progress
              value={Math.min(((data?.totalPower || 0) / 100) * 100, 100)}
              color="warning"
              className="mt-2"
              size="sm"
            />
            <p className="text-xs opacity-90 mt-1">Live consumption</p>
          </CardBody>
        </Card>

        {/* Active Devices */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdSignalWifiStatusbar4Bar className="w-6 h-6" />
              <span className="text-sm font-medium">Active Devices</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">{getActiveDevices()}</div>
            <p className="text-xs opacity-90 mt-1">
              of {getTotalDevices()} total
            </p>
          </CardBody>
        </Card>

        {/* Critical Alerts */}
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdError className="w-6 h-6" />
              <span className="text-sm font-medium">Critical Alerts</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">{getCriticalAlerts()}</div>
            <p className="text-xs opacity-90 mt-1">Immediate attention</p>
          </CardBody>
        </Card>

        {/* Total Alerts */}
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdNotifications className="w-6 h-6" />
              <span className="text-sm font-medium">Total Alerts</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">
              {data?.latestAlerts?.length || 0}
            </div>
            <p className="text-xs opacity-90 mt-1">Recent activity</p>
          </CardBody>
        </Card>
      </div>

      {/* Device Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.deviceStats?.map((stat) => {
          const config = getStatusConfig(stat.status);
          return (
            <Card
              key={stat.status}
              className={`hover:shadow-lg transition-shadow ${config.bgColor}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  {config.icon}
                  <span className={`text-sm font-medium ${config.textColor}`}>
                    {stat.status} Devices
                  </span>
                </div>
                <Chip color={config.color} variant={config.variant} size="sm">
                  <IoHardwareChip className="w-3 h-3 mr-1" />
                  {stat.status}
                </Chip>
              </CardHeader>
              <CardBody className="pt-0">
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {stat._count}
                </div>
                <div className="flex items-center space-x-1 text-xs text-default-500 mt-1">
                  <MdDevices className="w-3 h-3" />
                  <span>
                    {((stat._count / getTotalDevices()) * 100 || 0).toFixed(1)}%
                    of fleet
                  </span>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Latest Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MdNotifications className="w-5 h-5 text-default-600" />
              <h3 className="text-lg font-semibold">Latest Alerts</h3>
            </div>
            <Badge content={data?.latestAlerts?.length || 0} color="primary">
              <IoAlert className="w-5 h-5 text-default-400" />
            </Badge>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          {!data?.latestAlerts || data.latestAlerts.length === 0 ? (
            <div className="text-center py-8">
              <MdCheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-default-500">
                No alerts - All systems running smoothly
              </p>
            </div>
          ) : (
            data.latestAlerts.map((alert) => {
              const alertConfig = getAlertConfig(alert.level);
              return (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${alertConfig.borderColor}`}
                >
                  <CardBody className="py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {alertConfig.icon}
                          <p className="font-medium text-foreground">
                            {alert.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 mt-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            color="default"
                            startContent={
                              <IoHardwareChip className="w-3 h-3" />
                            }
                          >
                            {alert.device.deviceId}
                          </Chip>
                          <div className="flex items-center text-xs text-default-500">
                            <MdAccessTime className="w-3 h-3 mr-1" />
                            {formatRelativeTime(alert.createdAt)}
                          </div>
                          <div className="text-xs text-default-400">
                            {new Date(alert.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Chip
                        color={alertConfig.color}
                        variant={alertConfig.variant}
                        size="sm"
                        startContent={alertConfig.icon}
                      >
                        {alert.level}
                      </Chip>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
}
