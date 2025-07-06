'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Select, SelectItem, Input, Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Chip, Spinner, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react';
import { TelemetryData } from '@/types';

interface Device {
  id: string;
  deviceId: string;
  status: string;
  location: {
    coordinates: number[];
    address: string;
  };
  powerRating: string;
}

interface TelemetryReport {
  deviceId: string;
  telemetry: TelemetryData[];
}

export default function TelemetryPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTelemetry, setSelectedTelemetry] = useState<TelemetryData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Set default dates (last 7 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        setDevices(data.devices || []);
        
        // Check for deviceId in URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const deviceIdFromUrl = urlParams.get('deviceId');
        
        if (deviceIdFromUrl && data.devices.some((d: Device) => d.deviceId === deviceIdFromUrl)) {
          setSelectedDevice(deviceIdFromUrl);
        } else if (data.devices && data.devices.length > 0) {
          setSelectedDevice(data.devices[0].deviceId);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);

  // Fetch telemetry data when device or dates change
  useEffect(() => {
    if (selectedDevice && startDate && endDate) {
      fetchTelemetryData();
    }
  }, [selectedDevice, startDate, endDate]);

  const fetchTelemetryData = async () => {
    if (!selectedDevice || !startDate || !endDate) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/telemetry/report?deviceId=${selectedDevice}&startDate=${startDate}&endDate=${endDate}`
      );
      const data: TelemetryReport = await response.json();
      setTelemetryData(data.telemetry || []);
    } catch (error) {
      console.error('Error fetching telemetry data:', error);
      setTelemetryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTelemetryView = (telemetry: TelemetryData) => {
    setSelectedTelemetry(telemetry);
    onOpen();
  };

  const calculateAverage = (values: number[]) => {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const calculateMinMax = (values: number[]) => {
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'success';
      case 'OFFLINE': return 'danger';
      case 'FAULT': return 'warning';
      case 'MAINTENANCE': return 'secondary';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const selectedDeviceData = devices.find(d => d.deviceId === selectedDevice);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Telemetry Analysis</h1>
        <Button 
          color="primary" 
          onClick={fetchTelemetryData}
          isLoading={loading}
        >
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Filters</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Select Device"
              placeholder="Choose a device"
              selectedKeys={selectedDevice ? [selectedDevice] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedDevice(selected);
              }}
              className="max-w-xs"
            >
              {devices.map((device) => (
                <SelectItem key={device.deviceId}>
                  <div className="flex items-center gap-2">
                    <span>{device.deviceId}</span>
                    <Chip size="sm" color={getStatusColor(device.status)}>
                      {device.status}
                    </Chip>
                  </div>
                </SelectItem>
              ))}
            </Select>

            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="max-w-xs"
            />

            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="max-w-xs"
            />

            <div className="flex items-end">
              <Button 
                color="primary" 
                onClick={fetchTelemetryData}
                isLoading={loading}
                className="w-full"
              >
                Load Data
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Device Info */}
      {selectedDeviceData && (
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Device Information</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Device ID</h3>
                <p className="text-white">{selectedDeviceData.deviceId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Status</h3>
                <Chip color={getStatusColor(selectedDeviceData.status)}>
                  {selectedDeviceData.status}
                </Chip>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Power Rating</h3>
                <p className="text-white">{selectedDeviceData.powerRating}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Location</h3>
                <p className="text-white">{selectedDeviceData.location.address}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Coordinates</h3>
                <p className="text-white">
                  {selectedDeviceData.location.coordinates[1].toFixed(4)}, {selectedDeviceData.location.coordinates[0].toFixed(4)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Data Points</h3>
                <p className="text-white">{telemetryData.length} readings</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Statistics */}
      {telemetryData.length > 0 && (
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Telemetry Statistics</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <h3 className="text-sm font-medium text-slate-400">Average Voltage</h3>
                <p className="text-2xl font-bold text-blue-400">
                  {telemetryData.length > 0 
                    ? calculateAverage(telemetryData.flatMap(t => t.voltage)).toFixed(1)
                    : '0'
                  }V
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-slate-400">Average Current</h3>
                <p className="text-2xl font-bold text-green-400">
                  {telemetryData.length > 0 
                    ? calculateAverage(telemetryData.flatMap(t => t.current)).toFixed(2)
                    : '0'
                  }A
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-slate-400">Average Power</h3>
                <p className="text-2xl font-bold text-purple-400">
                  {telemetryData.length > 0 
                    ? calculateAverage(telemetryData.flatMap(t => t.power)).toFixed(1)
                    : '0'
                  }W
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-slate-400">Average Temperature</h3>
                <p className="text-2xl font-bold text-orange-400">
                  {telemetryData.length > 0 
                    ? calculateAverage(telemetryData.map(t => t.temperature)).toFixed(1)
                    : '0'
                  }°C
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Telemetry Data Table */}
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Telemetry History</h2>
          <Chip color="primary" variant="flat" className="ml-auto">
            {telemetryData.length} readings
          </Chip>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : telemetryData.length > 0 ? (
            <Table aria-label="Telemetry data table" className="bg-transparent">
              <TableHeader>
                <TableColumn>Timestamp</TableColumn>
                <TableColumn>Voltage (V)</TableColumn>
                <TableColumn>Current (A)</TableColumn>
                <TableColumn>Power (W)</TableColumn>
                <TableColumn>Temperature (°C)</TableColumn>
                <TableColumn>Power Factor</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {telemetryData
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((telemetry, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {formatTimestamp(telemetry.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {telemetry.voltage.map((v, i) => (
                            <div key={i} className="text-xs">
                              Phase {i + 1}: {v.toFixed(1)}V
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {telemetry.current.map((c, i) => (
                            <div key={i} className="text-xs">
                              Phase {i + 1}: {c.toFixed(2)}A
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {telemetry.power.map((p, i) => (
                            <div key={i} className="text-xs">
                              Phase {i + 1}: {p.toFixed(1)}W
                            </div>
                          ))}
                          <div className="text-xs font-semibold text-blue-400">
                            Total: {telemetry.totalPower.toFixed(1)}W
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {telemetry.temperature.toFixed(1)}°C
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {telemetry.powerFactor.map((pf, i) => (
                            <div key={i} className="text-xs">
                              Phase {i + 1}: {pf.toFixed(3)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onClick={() => handleTelemetryView(telemetry)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>No telemetry data available for the selected criteria</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Telemetry Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent className="bg-slate-900 border border-slate-700">
          <ModalHeader className="text-white">
            Telemetry Details
          </ModalHeader>
          <ModalBody>
            {selectedTelemetry && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Timestamp</h3>
                    <p className="text-white">{formatTimestamp(selectedTelemetry.timestamp)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Temperature</h3>
                    <p className="text-white">{selectedTelemetry.temperature.toFixed(1)}°C</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Total Power</h3>
                    <p className="text-white">{selectedTelemetry.totalPower.toFixed(1)}W</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Total Energy</h3>
                    <p className="text-white">{selectedTelemetry.totalEnergy.toFixed(2)}kWh</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Frequency</h3>
                    <p className="text-white">{selectedTelemetry.frequency.toFixed(1)}Hz</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">RTC Drift</h3>
                    <p className="text-white">{selectedTelemetry.rtcDrift?.toFixed(2) || '0.00'}s</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Voltage (V)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.voltage.map((v, i) => (
                      <div key={i} className="bg-slate-800 p-3 rounded text-center">
                        <div className="text-xs text-slate-400">Phase {i + 1}</div>
                        <div className="text-lg font-semibold text-white">{v.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Current (A)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.current.map((c, i) => (
                      <div key={i} className="bg-slate-800 p-3 rounded text-center">
                        <div className="text-xs text-slate-400">Phase {i + 1}</div>
                        <div className="text-lg font-semibold text-white">{c.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Power (W)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.power.map((p, i) => (
                      <div key={i} className="bg-slate-800 p-3 rounded text-center">
                        <div className="text-xs text-slate-400">Phase {i + 1}</div>
                        <div className="text-lg font-semibold text-white">{p.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Power Factor</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.powerFactor.map((pf, i) => (
                      <div key={i} className="bg-slate-800 p-3 rounded text-center">
                        <div className="text-xs text-slate-400">Phase {i + 1}</div>
                        <div className="text-lg font-semibold text-white">{pf.toFixed(3)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Phase Status</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTelemetry.phaseStatus.map((status, i) => (
                      <div key={i} className="bg-slate-800 p-3 rounded text-center">
                        <div className="text-xs text-slate-400">Phase {i + 1}</div>
                        <Chip 
                          size="sm" 
                          color={status ? "success" : "danger"}
                        >
                          {status ? "Active" : "Inactive"}
                        </Chip>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Door Status</h3>
                    <Chip 
                      size="sm" 
                      color={selectedTelemetry.doorStatus ? "warning" : "success"}
                    >
                      {selectedTelemetry.doorStatus ? "Open" : "Closed"}
                    </Chip>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">AC Power Status</h3>
                    <Chip 
                      size="sm" 
                      color={selectedTelemetry.acPowerStatus ? "success" : "danger"}
                    >
                      {selectedTelemetry.acPowerStatus ? "Connected" : "Disconnected"}
                    </Chip>
                  </div>
                </div>
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