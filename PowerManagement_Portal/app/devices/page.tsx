"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import { DeviceStatus } from "@/types";

interface Device {
  id: string;
  deviceId: string;
  status: "ONLINE" | "OFFLINE" | "FAULT";
  location: {
    coordinates: [number, number];
    address: string;
  };
  powerRating: string;
  voltage: string;
  frequency: string;
  incomingCurrent: string;
  ipRating: string;
  currentPower: number;
  temperature: number | null;
  lastUpdate: string | null;
  alertLevel: string | null;
  alertMessage: string | null;
}

// Custom icons for the devices page
const FilterIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
    <path d="M3 4h18v2.172a2 2 0 0 1-.586 1.414l-4.702 4.702a2 2 0 0 0-.586 1.414V20l-4-2v-6.172a2 2 0 0 0-.586-1.414L3.586 7.586A2 2 0 0 1 3 6.172V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThermometerIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("deviceId");
  
  // Add Device Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceId: "",
    powerRating: "",
    voltage: "",
    frequency: "",
    incomingCurrent: "",
    ipRating: "",
    status: DeviceStatus.OFFLINE,
    address: "",
    longitude: "",
    latitude: ""
  });

  // Add state for editing device
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editDeviceData, setEditDeviceData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices");
      const data = await response.json();
      setDevices(data.devices || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching devices:", error);
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    switch (sortBy) {
      case "deviceId":
        return a.deviceId.localeCompare(b.deviceId);
      case "status":
        return a.status.localeCompare(b.status);
      case "power":
        return b.currentPower - a.currentPower;
      case "location":
        return a.location.address.localeCompare(b.location.address);
      default:
        return 0;
    }
  });

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

  const handleAddDevice = async () => {
    setIsAdding(true);
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId: newDevice.deviceId,
          powerRating: newDevice.powerRating,
          voltage: newDevice.voltage,
          frequency: newDevice.frequency,
          incomingCurrent: newDevice.incomingCurrent,
          ipRating: newDevice.ipRating,
          coordinates: [parseFloat(newDevice.longitude) || 0, parseFloat(newDevice.latitude) || 0],
          address: newDevice.address
        }),
      });

      if (response.ok) {
        await fetchDevices(); // Refresh the devices list
        setIsAddModalOpen(false);
        // Reset form
        setNewDevice({
          deviceId: "",
          powerRating: "",
          voltage: "",
          frequency: "",
          incomingCurrent: "",
          ipRating: "",
          status: DeviceStatus.OFFLINE,
          address: "",
          longitude: "",
          latitude: ""
        });
        alert("Device added successfully!");
      } else {
        const error = await response.json();
        alert(`Error adding device: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding device:", error);
      alert("Error adding device");
    } finally {
      setIsAdding(false);
    }
  };

  const resetAddDeviceForm = () => {
    setNewDevice({
      deviceId: "",
      powerRating: "",
      voltage: "",
      frequency: "",
      incomingCurrent: "",
      ipRating: "",
      status: DeviceStatus.OFFLINE,
      address: "",
      longitude: "",
      latitude: ""
    });
  };

  // Edit button handler
  const handleEditClick = (device: Device) => {
    setEditingDevice(device);
    setEditDeviceData({
      ...device,
      longitude: device.location.coordinates[0].toString(),
      latitude: device.location.coordinates[1].toString(),
      address: device.location.address,
    });
    setIsEditModalOpen(true);
  };

  // Edit device API call
  const handleEditDevice = async () => {
    if (!editingDevice) return;
    setIsEditing(true);
    try {
      const response = await fetch(`/api/devices/${editingDevice.deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: editDeviceData.deviceId,
          powerRating: editDeviceData.powerRating,
          voltage: editDeviceData.voltage,
          frequency: editDeviceData.frequency,
          incomingCurrent: editDeviceData.incomingCurrent,
          ipRating: editDeviceData.ipRating,
          status: editDeviceData.status,
          location: {
            coordinates: [parseFloat(editDeviceData.longitude) || 0, parseFloat(editDeviceData.latitude) || 0],
            address: editDeviceData.address
          }
        })
      });
      if (response.ok) {
        await fetchDevices();
        setIsEditModalOpen(false);
        setEditingDevice(null);
        setEditDeviceData(null);
        alert("Device updated successfully!");
      } else {
        const error = await response.json();
        alert(`Error updating device: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating device:", error);
      alert("Error updating device");
    } finally {
      setIsEditing(false);
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Device Management</h1>
        <p className="text-slate-400">Monitor and manage all CCMS devices</p>
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700 mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<SearchIcon className="text-slate-400" />}
              className="bg-slate-800/50 border-slate-600"
            />
            <Select
              placeholder="Filter by status"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
              startContent={<FilterIcon />}
              className="bg-slate-800/50 border-slate-600"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="ONLINE">Online</SelectItem>
              <SelectItem key="OFFLINE">Offline</SelectItem>
              <SelectItem key="FAULT">Fault</SelectItem>
            </Select>
            <Select
              placeholder="Sort by"
              selectedKeys={[sortBy]}
              onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
              className="bg-slate-800/50 border-slate-600"
            >
              <SelectItem key="deviceId">Device ID</SelectItem>
              <SelectItem key="status">Status</SelectItem>
              <SelectItem key="power">Power Usage</SelectItem>
              <SelectItem key="location">Location</SelectItem>
            </Select>
            <Button
              color="primary"
              className="bg-gradient-to-r from-sky-500 to-blue-600"
              startContent={<PlusIcon />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Device
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Total Devices</h3>
            <p className="text-3xl font-bold text-sky-400">{devices.length}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Online</h3>
            <p className="text-3xl font-bold text-green-400">
              {devices.filter(d => d.status === "ONLINE").length}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Fault</h3>
            <p className="text-3xl font-bold text-red-400">
              {devices.filter(d => d.status === "FAULT").length}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Total Power</h3>
            <p className="text-3xl font-bold text-purple-400">
              {devices.reduce((sum, d) => sum + d.currentPower, 0).toFixed(1)} kW
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDevices.map((device) => (
          <Card key={device.id} className="bg-slate-900/70 backdrop-blur-md border border-slate-700 hover:border-slate-600 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{device.deviceId}</h3>
                  <p className="text-sm text-slate-400">{device.powerRating}</p>
                </div>
                <Chip
                  color={getStatusColor(device.status)}
                  variant="flat"
                  size="sm"
                >
                  {device.status}
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="space-y-3">
                {/* Location */}
                <div className="flex items-center space-x-2">
                  <MapPinIcon />
                  <span className="text-sm text-slate-300">{device.location.address}</span>
                </div>

                {/* Power and Temperature */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <ZapIcon />
                    <div>
                      <p className="text-sm text-slate-300">{device.currentPower.toFixed(1)} kW</p>
                      <p className="text-xs text-slate-400">Current</p>
                    </div>
                  </div>
                  {device.temperature && (
                    <div className="flex items-center space-x-2">
                      <ThermometerIcon />
                      <div>
                        <p className="text-sm text-slate-300">{device.temperature.toFixed(1)}°C</p>
                        <p className="text-xs text-slate-400">Temp</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alert */}
                {device.alertLevel && (
                  <Chip
                    color={getAlertColor(device.alertLevel)}
                    variant="flat"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {device.alertMessage}
                  </Chip>
                )}

                {/* Last Update */}
                {device.lastUpdate && (
                  <p className="text-xs text-slate-500">
                    Last update: {new Date(device.lastUpdate).toLocaleTimeString()}
                  </p>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat" 
                    className="flex-1"
                    onClick={() => handleEditClick(device)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" color="secondary" variant="flat" className="flex-1">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {sortedDevices.length === 0 && (
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody className="text-center py-12">
            <p className="text-slate-400">No devices found matching your criteria</p>
          </CardBody>
        </Card>
      )}

      {/* Add Device Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        onOpenChange={(open: boolean) => {
          if (!open) {
            resetAddDeviceForm();
          }
        }}
      >
        <ModalContent className="bg-slate-900 border border-slate-700">
          <ModalHeader className="text-white">
            <h2 className="text-xl font-semibold">Add New Device</h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Device ID"
                  value={newDevice.deviceId}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="e.g., CCMS-001"
                  isRequired
                />
                <Input
                  label="Power Rating"
                  value={newDevice.powerRating}
                  onChange={(e) => setNewDevice({ ...newDevice, powerRating: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="e.g., 50kW"
                  isRequired
                />
                <Input
                  label="Voltage"
                  value={newDevice.voltage}
                  onChange={(e) => setNewDevice({ ...newDevice, voltage: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="e.g., 415V"
                  isRequired
                />
                <Input
                  label="Frequency"
                  value={newDevice.frequency}
                  onChange={(e) => setNewDevice({ ...newDevice, frequency: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="e.g., 50Hz"
                  isRequired
                />
                <Input
                  label="Incoming Current"
                  value={newDevice.incomingCurrent}
                  onChange={(e) => setNewDevice({ ...newDevice, incomingCurrent: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="e.g., 48A"
                  isRequired
                />
                <Input
                  label="IP Rating"
                  value={newDevice.ipRating}
                  onChange={(e) => setNewDevice({ ...newDevice, ipRating: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="e.g., IP65"
                  isRequired
                />
              </div>

              <Input
                label="Address"
                value={newDevice.address}
                onChange={(e) => setNewDevice({ ...newDevice, address: e.target.value })}
                variant="bordered"
                color="primary"
                placeholder="Device location address"
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Longitude"
                  type="number"
                  value={newDevice.longitude}
                  onChange={(e) => setNewDevice({ ...newDevice, longitude: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="0.000000"
                  step="0.000001"
                />
                <Input
                  label="Latitude"
                  type="number"
                  value={newDevice.latitude}
                  onChange={(e) => setNewDevice({ ...newDevice, latitude: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="0.000000"
                  step="0.000001"
                />
              </div>

              <Select
                label="Initial Status"
                selectedKeys={[newDevice.status]}
                onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value as DeviceStatus })}
                variant="bordered"
                color="primary"
              >
                <SelectItem key={DeviceStatus.OFFLINE}>
                  Offline
                </SelectItem>
                <SelectItem key={DeviceStatus.ONLINE}>
                  Online
                </SelectItem>
                <SelectItem key={DeviceStatus.FAULT}>
                  Fault
                </SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="flat" 
              onPress={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleAddDevice}
              isLoading={isAdding}
              isDisabled={!newDevice.deviceId || !newDevice.powerRating || !newDevice.voltage || !newDevice.frequency || !newDevice.incomingCurrent || !newDevice.ipRating}
            >
              Add Device
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Device Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        onOpenChange={(open: boolean) => {
          if (!open) {
            setEditingDevice(null);
            setEditDeviceData(null);
          }
        }}
      >
        <ModalContent className="bg-slate-900 border border-slate-700">
          <ModalHeader className="text-white">
            <h2 className="text-xl font-semibold">Edit Device</h2>
          </ModalHeader>
          <ModalBody>
            {editDeviceData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Device ID"
                    value={editDeviceData.deviceId}
                    onChange={(e) => setEditDeviceData({ ...editDeviceData, deviceId: e.target.value })}
                    variant="bordered"
                    color="primary"
                    placeholder="e.g., CCMS-001"
                    isRequired
                  />
                  <Input
                    label="Power Rating"
                    value={editDeviceData.powerRating}
                    onChange={(e) => setEditDeviceData({ ...editDeviceData, powerRating: e.target.value })}
                    variant="bordered"
                    color="primary"
                    placeholder="e.g., 50kW"
                    isRequired
                  />
                  <Input
                    label="Voltage"
                    value={editDeviceData.voltage}
                    onChange={(e) => setEditDeviceData({ ...editDeviceData, voltage: e.target.value })}
                    variant="bordered"
                    color="primary"
                    placeholder="e.g., 415V"
                    isRequired
                  />
                  <Input
                    label="Frequency"
                    value={editDeviceData.frequency}
                    onChange={(e) => setEditDeviceData({ ...editDeviceData, frequency: e.target.value })}
                    variant="bordered"
                    color="primary"
                    placeholder="e.g., 50Hz"
                    isRequired
                  />
                  <Input
                    label="Incoming Current"
                    value={editDeviceData.incomingCurrent}
                    onChange={(e) => setEditDeviceData({ ...editDeviceData, incomingCurrent: e.target.value })}
                    variant="bordered"
                    color="primary"
                    placeholder="e.g., 48A"
                    isRequired
                  />
                  <Input
                    label="IP Rating"
                    value={editDeviceData.ipRating}
                    onChange={(e) => setEditDeviceData({ ...editDeviceData, ipRating: e.target.value })}
                    variant="bordered"
                    color="primary"
                    placeholder="e.g., IP65"
                    isRequired
                  />
                </div>
                <Input
                  label="Address"
                  value={editDeviceData.address}
                  onChange={(e) => setEditDeviceData({ ...editDeviceData, address: e.target.value })}
                  variant="bordered"
                  color="primary"
                  placeholder="Device location address"
                  isRequired
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Longitude"
                    type="number"
                    value={editDeviceData.longitude}
                    onChange={(e) => setEditDeviceData({ ...editDeviceData, longitude: e.target.value })}
                    variant="bordered"
                    color="primary"
                    placeholder="0.000000"
                    step="0.000001"
                  />
                  <Input
                    label="Latitude"
                    type="number"
                    value={editDeviceData.latitude}
                    onChange={(e) => setEditDeviceData({ ...editDeviceData, latitude: e.target.value })}
                    variant="bordered"
                    color="primary"
                    placeholder="0.000000"
                    step="0.000001"
                  />
                </div>
                <Select
                  label="Status"
                  selectedKeys={[editDeviceData.status]}
                  onChange={(e) => setEditDeviceData({ ...editDeviceData, status: e.target.value as DeviceStatus })}
                  variant="bordered"
                  color="primary"
                >
                  <SelectItem key={DeviceStatus.OFFLINE}>Offline</SelectItem>
                  <SelectItem key={DeviceStatus.ONLINE}>Online</SelectItem>
                  <SelectItem key={DeviceStatus.FAULT}>Fault</SelectItem>
                </Select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="flat" 
              onPress={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleEditDevice}
              isLoading={isEditing}
              isDisabled={!editDeviceData || !editDeviceData.deviceId || !editDeviceData.powerRating || !editDeviceData.voltage || !editDeviceData.frequency || !editDeviceData.incomingCurrent || !editDeviceData.ipRating}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 