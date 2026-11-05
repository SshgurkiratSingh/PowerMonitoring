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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Input,
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
  MdGroup,
  MdControlCamera,
  MdSettings,
  MdAnalytics,
  MdSpeed,
  MdThermostat,
  MdElectricMeter,
  MdPowerSettingsNew,
  MdPlayArrow,
  MdStop,
  MdPause,
} from "react-icons/md";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { IoStatsChart, IoHardwareChip, IoAlert, IoFlash } from "react-icons/io5";
import { DashboardStats, FleetOverview, EnergyAnalytics, DeviceGroup, CommandType } from "@/types";

interface DeviceStats {
  status: "ONLINE" | "OFFLINE" | "FAULT" | "MAINTENANCE";
  _count: number;
}

interface LatestAlert {
  id: string;
  message: string;
  level: "INFO" | "WARNING" | "CRITICAL" | "EMERGENCY";
  type: string;
  value?: number;
  threshold?: number;
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
  dashboardStats: DashboardStats;
  fleetOverview: FleetOverview;
  energyAnalytics: EnergyAnalytics;
  error?: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [commandType, setCommandType] = useState<CommandType>(CommandType.POWER_ON);
  const [commandValue, setCommandValue] = useState<string>("ON");
  const [sendingCommand, setSendingCommand] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchDashboardData = async () => {
    try {
      if (!loading) setRefreshing(true);
      const [statsResponse, groupsResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/devices/groups"),
      ]);

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsResult = await statsResponse.json();
      const groupsResult = await groupsResponse.json();

      console.log("Dashboard data received:", statsResult);
      setData(statsResult);
      setDeviceGroups(groupsResult.groups || []);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
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
      case "MAINTENANCE":
        return {
          color: "warning" as const,
          icon: <MdSettings className="w-5 h-5" />,
          variant: "flat" as const,
          bgColor: "bg-warning-100",
          textColor: "text-warning-700",
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
      case "EMERGENCY":
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
      data?.latestAlerts?.filter((alert) => 
        alert.level === "CRITICAL" || alert.level === "EMERGENCY"
      )?.length || 0
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

  const handleSendCommand = async () => {
    if (!selectedGroup) return;

    setSendingCommand(true);
    try {
      const response = await fetch("/api/devices/commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroup,
          commandType,
          value: commandValue,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Command sent:", result);
        onClose();
        // Refresh dashboard data
        setTimeout(fetchDashboardData, 2000);
      } else {
        console.error("Failed to send command");
      }
    } catch (error) {
      console.error("Error sending command:", error);
    } finally {
      setSendingCommand(false);
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
        <div className="flex space-x-2">
          <Button
            color="primary"
            variant="flat"
            onPress={onOpen}
            startContent={<MdControlCamera className="w-4 h-4" />}
          >
            Send Command
          </Button>
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
      </div>

      {/* Fleet Overview - Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {data?.dashboardStats?.totalPower?.toFixed(1) || 0} kW
            </div>
            <Progress
              value={Math.min(((data?.dashboardStats?.totalPower || 0) / 100) * 100, 100)}
              color="warning"
              className="mt-2"
              size="sm"
            />
            <p className="text-xs opacity-90 mt-1">Live consumption</p>
          </CardBody>
        </Card>

        {/* Network Health */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdSignalWifiStatusbar4Bar className="w-6 h-6" />
              <span className="text-sm font-medium">Network Health</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">
              {data?.dashboardStats?.networkHealth?.toFixed(1) || 0}%
            </div>
            <Progress
              value={data?.dashboardStats?.networkHealth || 0}
              color="success"
              className="mt-2"
              size="sm"
            />
            <p className="text-xs opacity-90 mt-1">
              {data?.dashboardStats?.onlineDevices || 0} of {data?.dashboardStats?.totalDevices || 0} online
            </p>
          </CardBody>
        </Card>

        {/* Energy Savings */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <IoFlash className="w-6 h-6" />
              <span className="text-sm font-medium">Energy Savings</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">
              {data?.fleetOverview?.energySavings?.toFixed(1) || 0} kWh
            </div>
            <p className="text-xs opacity-90 mt-1">This month</p>
          </CardBody>
        </Card>

        {/* Device Groups */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdGroup className="w-6 h-6" />
              <span className="text-sm font-medium">Device Groups</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">
              {data?.dashboardStats?.deviceGroups || 0}
            </div>
            <p className="text-xs opacity-90 mt-1">Managed groups</p>
          </CardBody>
        </Card>
      </div>

      {/* Fleet Overview Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdDevices className="w-6 h-6" />
              <span className="text-sm font-medium">Total Panels</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-2xl font-bold">{data?.fleetOverview?.totalPanels || 0}</div>
            <p className="text-xs opacity-90 mt-1">Installed devices</p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdSpeed className="w-6 h-6" />
              <span className="text-sm font-medium">Total Feeders</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-2xl font-bold">{data?.fleetOverview?.totalFeeders || 0}</div>
            <p className="text-xs opacity-90 mt-1">Power distribution</p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdPower className="w-6 h-6" />
              <span className="text-sm font-medium">Total Lights</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-2xl font-bold">{data?.fleetOverview?.totalLights || 0}</div>
            <p className="text-xs opacity-90 mt-1">Individual lights</p>
          </CardBody>
        </Card>
      </div>

      {/* Energy Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MdAnalytics className="w-5 h-5 text-default-600" />
              <h3 className="text-lg font-semibold">Energy & Load Analytics</h3>
            </div>
            <Badge content="Real-time" color="success">
              <IoStatsChart className="w-5 h-5 text-default-400" />
            </Badge>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Voltage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">Voltage (V)</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {data?.energyAnalytics?.voltage?.map((v, i) => (
                  <div key={i} className="text-center p-2 bg-default-100 rounded">
                    <div className="text-lg font-bold text-primary">V{i + 1}</div>
                    <div className="text-sm">{v.toFixed(1)}V</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MdElectricMeter className="w-5 h-5 text-warning" />
                <h4 className="font-semibold">Current (A)</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {data?.energyAnalytics?.current?.map((c, i) => (
                  <div key={i} className="text-center p-2 bg-default-100 rounded">
                    <div className="text-lg font-bold text-warning">I{i + 1}</div>
                    <div className="text-sm">{c.toFixed(1)}A</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Power Factor */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MdThermostat className="w-5 h-5 text-success" />
                <h4 className="font-semibold">Power Factor</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {data?.energyAnalytics?.powerFactor?.map((pf, i) => (
                  <div key={i} className="text-center p-2 bg-default-100 rounded">
                    <div className="text-lg font-bold text-success">PF{i + 1}</div>
                    <div className="text-sm">{pf.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-6 pt-4 border-t border-default-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {data?.energyAnalytics?.frequency?.toFixed(1) || 0} Hz
                </div>
                <div className="text-sm text-default-500">Frequency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {data?.energyAnalytics?.temperature?.toFixed(1) || 0}°C
                </div>
                <div className="text-sm text-default-500">Temperature</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {data?.energyAnalytics?.phaseStatus?.filter(Boolean).length || 0}/3
                </div>
                <div className="text-sm text-default-500">Active Phases</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-danger">
                  {data?.dashboardStats?.criticalAlerts || 0}
                </div>
                <div className="text-sm text-default-500">Critical Alerts</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Device Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          {alert.value && alert.threshold && (
                            <div className="text-xs text-default-400">
                              {alert.value} / {alert.threshold}
                            </div>
                          )}
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

      {/* Command Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center space-x-2">
              <MdControlCamera className="w-5 h-5" />
              <span>Send Command</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Device Group"
                placeholder="Select a device group"
                selectedKeys={selectedGroup ? [selectedGroup] : []}
                onSelectionChange={(keys) => setSelectedGroup(Array.from(keys)[0] as string)}
              >
                {deviceGroups.map((group) => (
                  <SelectItem key={group.id}>
                    {group.name} ({group.devices.length} devices)
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Command Type"
                selectedKeys={[commandType]}
                onSelectionChange={(keys) => setCommandType(Array.from(keys)[0] as CommandType)}
              >
                <SelectItem key={CommandType.POWER_ON}>Power On</SelectItem>
                <SelectItem key={CommandType.POWER_OFF}>Power Off</SelectItem>
                <SelectItem key={CommandType.DIMMING}>Dimming</SelectItem>
                <SelectItem key={CommandType.RESET}>Reset</SelectItem>
                <SelectItem key={CommandType.DIAGNOSTIC}>Diagnostic</SelectItem>
              </Select>

              <Input
                label="Command Value"
                value={commandValue}
                onChange={(e) => setCommandValue(e.target.value)}
                placeholder="ON, OFF, 50%, etc."
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSendCommand}
              isLoading={sendingCommand}
              isDisabled={!selectedGroup}
            >
              {sendingCommand ? "Sending..." : "Send Command"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
