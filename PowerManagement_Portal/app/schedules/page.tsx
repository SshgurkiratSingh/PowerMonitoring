"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { useState, useEffect } from "react";

interface Schedule {
  id: string;
  deviceId: string;
  device: {
    deviceId: string;
    location: {
      address: string;
    };
  };
  startTime: string;
  endTime: string;
  mode: "AUTO" | "MANUAL" | "TWILIGHT";
}

interface Device {
  id: string;
  deviceId: string;
  location: {
    address: string;
  };
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state for new schedule
  const [formData, setFormData] = useState({
    deviceId: "",
    startTime: "",
    endTime: "",
    mode: "AUTO" as "AUTO" | "MANUAL" | "TWILIGHT"
  });

  useEffect(() => {
    fetchSchedules();
    fetchDevices();
    const interval = setInterval(fetchSchedules, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules");
      const data = await response.json();
      setSchedules(data.schedules || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices");
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesDevice = filterDevice === "all" || schedule.deviceId === filterDevice;
    const matchesMode = filterMode === "all" || schedule.mode === filterMode;
    return matchesDevice && matchesMode;
  });

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "AUTO":
        return "primary";
      case "MANUAL":
        return "secondary";
      case "TWILIGHT":
        return "warning";
      default:
        return "default";
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "AUTO":
        return "🤖";
      case "MANUAL":
        return "👤";
      case "TWILIGHT":
        return "🌅";
      default:
        return "⚙️";
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const response = await fetch("/api/schedules/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchSchedules();
        onClose();
        setFormData({
          deviceId: "",
          startTime: "",
          endTime: "",
          mode: "AUTO"
        });
      } else {
        console.error("Failed to create schedule");
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchSchedules();
      } else {
        console.error("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const isScheduleActive = (schedule: Schedule) => {
    const now = new Date();
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);
    return now >= start && now <= end;
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Schedule Management</h1>
        <p className="text-slate-400">Manage device operation schedules and automation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Total Schedules</h3>
            <p className="text-3xl font-bold text-sky-400">{schedules.length}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-400">
              {schedules.filter(s => isScheduleActive(s)).length}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Auto Mode</h3>
            <p className="text-3xl font-bold text-blue-400">
              {schedules.filter(s => s.mode === "AUTO").length}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Devices</h3>
            <p className="text-3xl font-bold text-purple-400">{devices.length}</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700 mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              placeholder="Filter by device"
              selectedKeys={[filterDevice]}
              onSelectionChange={(keys) => setFilterDevice(Array.from(keys)[0] as string)}
              className="bg-slate-800/50 border-slate-600"
            >
              <SelectItem key="all">All Devices</SelectItem>
              {devices.map(device => (
                <SelectItem key={device.id}>{device.deviceId}</SelectItem>
              ))}
            </Select>
            <Select
              placeholder="Filter by mode"
              selectedKeys={[filterMode]}
              onSelectionChange={(keys) => setFilterMode(Array.from(keys)[0] as string)}
              className="bg-slate-800/50 border-slate-600"
            >
              <SelectItem key="all">All Modes</SelectItem>
              <SelectItem key="AUTO">Auto</SelectItem>
              <SelectItem key="MANUAL">Manual</SelectItem>
              <SelectItem key="TWILIGHT">Twilight</SelectItem>
            </Select>
            <Button
              color="primary"
              className="bg-gradient-to-r from-sky-500 to-blue-600"
              onClick={onOpen}
            >
              Create Schedule
            </Button>
            <Button
              color="secondary"
              variant="flat"
              onClick={fetchSchedules}
            >
              Refresh
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchedules.map((schedule) => (
          <Card key={schedule.id} className="bg-slate-900/70 backdrop-blur-md border border-slate-700 hover:border-slate-600 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{schedule.device.deviceId}</h3>
                  <p className="text-sm text-slate-400">{schedule.device.location.address}</p>
                </div>
                <Chip
                  color={getModeColor(schedule.mode)}
                  variant="flat"
                  size="sm"
                  startContent={getModeIcon(schedule.mode)}
                >
                  {schedule.mode}
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="space-y-3">
                {/* Time Information */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Start:</span>
                    <span className="text-white text-sm">
                      {new Date(schedule.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">End:</span>
                    <span className="text-white text-sm">
                      {new Date(schedule.endTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Status:</span>
                  <Chip
                    color={isScheduleActive(schedule) ? "success" : "default"}
                    variant="flat"
                    size="sm"
                  >
                    {isScheduleActive(schedule) ? "Active" : "Inactive"}
                  </Chip>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat" 
                    className="flex-1"
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    color="danger" 
                    variant="flat" 
                    className="flex-1"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody className="text-center py-12">
            <p className="text-slate-400">No schedules found matching your criteria</p>
          </CardBody>
        </Card>
      )}

      {/* Create Schedule Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent className="bg-slate-900 border border-slate-700">
          <ModalHeader className="text-white">Create New Schedule</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Device"
                placeholder="Select a device"
                selectedKeys={formData.deviceId ? [formData.deviceId] : []}
                onSelectionChange={(keys) => setFormData({...formData, deviceId: Array.from(keys)[0] as string})}
                className="bg-slate-800/50 border-slate-600"
              >
                {devices.map(device => (
                  <SelectItem key={device.id}>{device.deviceId}</SelectItem>
                ))}
              </Select>
              
              <Input
                label="Start Time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="bg-slate-800/50 border-slate-600"
              />
              
              <Input
                label="End Time"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="bg-slate-800/50 border-slate-600"
              />
              
              <Select
                label="Mode"
                selectedKeys={[formData.mode]}
                onSelectionChange={(keys) => setFormData({...formData, mode: Array.from(keys)[0] as "AUTO" | "MANUAL" | "TWILIGHT"})}
                className="bg-slate-800/50 border-slate-600"
              >
                <SelectItem key="AUTO">Auto</SelectItem>
                <SelectItem key="MANUAL">Manual</SelectItem>
                <SelectItem key="TWILIGHT">Twilight</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateSchedule}>
              Create Schedule
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}