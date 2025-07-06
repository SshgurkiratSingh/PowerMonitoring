'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DeviceStatus, TelemetryData } from '@/types';
import { Button, Card, CardBody, CardHeader, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react';

interface Device {
  id: string;
  deviceId: string;
  powerRating: string;
  voltage: string;
  frequency: string;
  incomingCurrent: string;
  ipRating: string;
  status: DeviceStatus;
  location: {
    coordinates: number[];
    address: string;
  };
  telemetry: TelemetryData[];
  latestAlert?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExtendedTelemetryData extends TelemetryData {
  extraData?: Record<string, any>;
}

export default function DeviceEditPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.deviceId as string;
  
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTelemetry, setSelectedTelemetry] = useState<ExtendedTelemetryData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state
  const [formData, setFormData] = useState({
    deviceId: '',
    powerRating: '',
    voltage: '',
    frequency: '',
    incomingCurrent: '',
    ipRating: '',
    status: DeviceStatus.ONLINE,
    address: '',
    coordinates: [0, 0]
  });

  useEffect(() => {
    if (deviceId) {
      fetchDevice();
    }
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      const response = await fetch(`/api/devices/${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        setDevice(data.device);
        setFormData({
          deviceId: data.device.deviceId,
          powerRating: data.device.powerRating,
          voltage: data.device.voltage,
          frequency: data.device.frequency,
          incomingCurrent: data.device.incomingCurrent,
          ipRating: data.device.ipRating,
          status: data.device.status,
          address: data.device.location.address,
          coordinates: data.device.location.coordinates
        });
      } else {
        console.error('Device not found');
        router.push('/devices');
      }
    } catch (error) {
      console.error('Error fetching device:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          location: {
            coordinates: formData.coordinates,
            address: formData.address
          }
        }),
      });

      if (response.ok) {
        await fetchDevice(); // Refresh data
        alert('Device updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error updating device: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating device:', error);
      alert('Error updating device');
    } finally {
      setSaving(false);
    }
  };

  const handleTelemetryView = (telemetry: ExtendedTelemetryData) => {
    setSelectedTelemetry(telemetry);
    onOpen();
  };

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.ONLINE:
        return 'success';
      case DeviceStatus.OFFLINE:
        return 'default';
      case DeviceStatus.FAULT:
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Device Not Found</h1>
          <Button color="primary" onClick={() => router.push('/devices')}>
            Back to Devices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            color="default" 
            variant="flat" 
            onClick={() => router.push('/devices')}
          >
            ← Back to Devices
          </Button>
          <Chip color={getStatusColor(device.status)} variant="flat">
            {device.status}
          </Chip>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Edit Device: {device.deviceId}</h1>
        <p className="text-slate-400">Update device information and view telemetry data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Information Form */}
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Device Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Device ID"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                variant="bordered"
                color="primary"
              />
              <Input
                label="Power Rating"
                value={formData.powerRating}
                onChange={(e) => setFormData({ ...formData, powerRating: e.target.value })}
                variant="bordered"
                color="primary"
                placeholder="e.g., 50kW"
              />
              <Input
                label="Voltage"
                value={formData.voltage}
                onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                variant="bordered"
                color="primary"
                placeholder="e.g., 415V"
              />
              <Input
                label="Frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                variant="bordered"
                color="primary"
                placeholder="e.g., 50Hz"
              />
              <Input
                label="Incoming Current"
                value={formData.incomingCurrent}
                onChange={(e) => setFormData({ ...formData, incomingCurrent: e.target.value })}
                variant="bordered"
                color="primary"
                placeholder="e.g., 48A"
              />
              <Input
                label="IP Rating"
                value={formData.ipRating}
                onChange={(e) => setFormData({ ...formData, ipRating: e.target.value })}
                variant="bordered"
                color="primary"
                placeholder="e.g., IP65"
              />
            </div>
            
            <Select
              label="Status"
              selectedKeys={[formData.status]}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as DeviceStatus })}
              variant="bordered"
              color="primary"
            >
              <SelectItem key={DeviceStatus.ONLINE}>
                Online
              </SelectItem>
              <SelectItem key={DeviceStatus.OFFLINE}>
                Offline
              </SelectItem>
              <SelectItem key={DeviceStatus.FAULT}>
                Fault
              </SelectItem>
            </Select>

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              variant="bordered"
              color="primary"
              placeholder="Device location address"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Longitude"
                type="number"
                value={formData.coordinates[0].toString()}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  coordinates: [parseFloat(e.target.value) || 0, formData.coordinates[1]] 
                })}
                variant="bordered"
                color="primary"
                step="0.000001"
              />
              <Input
                label="Latitude"
                type="number"
                value={formData.coordinates[1].toString()}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  coordinates: [formData.coordinates[0], parseFloat(e.target.value) || 0] 
                })}
                variant="bordered"
                color="primary"
                step="0.000001"
              />
            </div>

            <Button
              color="primary"
              onClick={handleSave}
              isLoading={saving}
              className="w-full"
            >
              Save Changes
            </Button>
          </CardBody>
        </Card>

        {/* Telemetry Data */}
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Telemetry Data</h2>
            <Chip color="primary" variant="flat" className="ml-auto">
              {device.telemetry?.length || 0} readings
            </Chip>
          </CardHeader>
          <CardBody>
            {device.telemetry && device.telemetry.length > 0 ? (
              <div className="space-y-4">
                <Table aria-label="Telemetry data table" className="bg-transparent">
                  <TableHeader>
                    <TableColumn>Timestamp</TableColumn>
                    <TableColumn>Power (kW)</TableColumn>
                    <TableColumn>Temperature</TableColumn>
                    <TableColumn>Actions</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {device.telemetry
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
                      .map((telemetry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(telemetry.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {telemetry.power?.reduce((sum, p) => sum + (p || 0), 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {telemetry.temperature?.toFixed(1)}°C
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onClick={() => handleTelemetryView(telemetry as ExtendedTelemetryData)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>No telemetry data available</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Telemetry Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent className="bg-slate-900 border border-slate-700">
          <ModalHeader className="text-white">
            Telemetry Details
          </ModalHeader>
          <ModalBody>
            {selectedTelemetry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Timestamp</h3>
                    <p className="text-white">{new Date(selectedTelemetry.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Temperature</h3>
                    <p className="text-white">{selectedTelemetry.temperature?.toFixed(1)}°C</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Voltage (V)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.voltage?.map((v, i) => (
                      <div key={i} className="bg-slate-800 p-2 rounded text-center">
                        <span className="text-white">{v?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Current (A)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.current?.map((c, i) => (
                      <div key={i} className="bg-slate-800 p-2 rounded text-center">
                        <span className="text-white">{c?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Power (kW)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.power?.map((p, i) => (
                      <div key={i} className="bg-slate-800 p-2 rounded text-center">
                        <span className="text-white">{p?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Power Factor</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.powerFactor?.map((pf, i) => (
                      <div key={i} className="bg-slate-800 p-2 rounded text-center">
                        <span className="text-white">{pf?.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTelemetry.extraData && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Extra Data</h3>
                    <pre className="bg-slate-800 p-4 rounded text-sm text-white overflow-x-auto">
                      {JSON.stringify(selectedTelemetry.extraData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 