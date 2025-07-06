'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input, Textarea, Select, SelectItem, useDisclosure, Spinner } from '@heroui/react';

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

interface DeviceGroup {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  devices: Device[];
  _count: {
    devices: number;
    schedules: number;
  };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DeviceGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<Partial<DeviceGroup>>({});
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  useEffect(() => {
    fetchGroups();
    fetchDevices();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/devices/groups');
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!editingGroup.name) return;

    try {
      const response = await fetch('/api/devices/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingGroup.name,
          description: editingGroup.description || '',
          deviceIds: selectedDevices
        })
      });

      if (response.ok) {
        await fetchGroups();
        onClose();
        setEditingGroup({});
        setSelectedDevices([]);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup || !editingGroup.name) return;

    try {
      const response = await fetch(`/api/devices/groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingGroup.name,
          description: editingGroup.description || '',
          deviceIds: selectedDevices
        })
      });

      if (response.ok) {
        await fetchGroups();
        onEditClose();
        setSelectedGroup(null);
        setEditingGroup({});
        setSelectedDevices([]);
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const response = await fetch(`/api/devices/groups/${groupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleEditGroup = (group: DeviceGroup) => {
    setSelectedGroup(group);
    setEditingGroup({
      name: group.name,
      description: group.description || ''
    });
    setSelectedDevices(group.devices.map(d => d.id));
    onEditOpen();
  };

  const handleAddDevicesToGroup = async (groupId: string, deviceIds: string[]) => {
    try {
      const response = await fetch(`/api/devices/groups/${groupId}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceIds })
      });

      if (response.ok) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error adding devices to group:', error);
    }
  };

  const handleRemoveDevicesFromGroup = async (groupId: string, deviceIds: string[]) => {
    try {
      const response = await fetch(`/api/devices/groups/${groupId}/devices`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceIds })
      });

      if (response.ok) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error removing devices from group:', error);
    }
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Device Groups</h1>
        <Button color="primary" onClick={onOpen}>
          Create New Group
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Total Groups</h3>
            <p className="text-3xl font-bold text-sky-400">{groups.length}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Total Devices</h3>
            <p className="text-3xl font-bold text-green-400">
              {groups.reduce((sum, group) => sum + group._count.devices, 0)}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Active Schedules</h3>
            <p className="text-3xl font-bold text-purple-400">
              {groups.reduce((sum, group) => sum + group._count.schedules, 0)}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Ungrouped Devices</h3>
            <p className="text-3xl font-bold text-orange-400">
              {devices.filter(d => !groups.some(g => g.devices.some(gd => gd.id === d.id))).length}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Groups Table */}
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Device Groups</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Device groups table" className="bg-transparent">
              <TableHeader>
                <TableColumn>Group Name</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Devices</TableColumn>
                <TableColumn>Schedules</TableColumn>
                <TableColumn>Created</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="font-semibold text-white">{group.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-400 max-w-xs truncate">
                        {group.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Chip color="primary" variant="flat" size="sm">
                          {group._count.devices}
                        </Chip>
                        <div className="text-xs text-slate-400">
                          {group.devices.map(d => d.deviceId).join(', ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip color="secondary" variant="flat" size="sm">
                        {group._count.schedules}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-400">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onClick={() => handleEditGroup(group)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Group Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent className="bg-slate-900 border border-slate-700">
          <ModalHeader className="text-white">
            Create New Device Group
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Group Name"
                placeholder="Enter group name"
                value={editingGroup.name || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                variant="bordered"
                color="primary"
              />
              <Textarea
                label="Description"
                placeholder="Enter group description"
                value={editingGroup.description || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                variant="bordered"
                color="primary"
              />
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">
                  Select Devices
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={device.id}
                        checked={selectedDevices.includes(device.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDevices([...selectedDevices, device.id]);
                          } else {
                            setSelectedDevices(selectedDevices.filter(id => id !== device.id));
                          }
                        }}
                        className="rounded border-slate-600 bg-slate-800 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={device.id} className="text-sm text-white cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span>{device.deviceId}</span>
                          <Chip size="sm" color={getStatusColor(device.status)}>
                            {device.status}
                          </Chip>
                        </div>
                        <div className="text-xs text-slate-400">{device.location.address}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateGroup}>
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Group Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl" scrollBehavior="inside">
        <ModalContent className="bg-slate-900 border border-slate-700">
          <ModalHeader className="text-white">
            Edit Device Group
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Group Name"
                placeholder="Enter group name"
                value={editingGroup.name || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                variant="bordered"
                color="primary"
              />
              <Textarea
                label="Description"
                placeholder="Enter group description"
                value={editingGroup.description || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                variant="bordered"
                color="primary"
              />
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">
                  Select Devices
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit-${device.id}`}
                        checked={selectedDevices.includes(device.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDevices([...selectedDevices, device.id]);
                          } else {
                            setSelectedDevices(selectedDevices.filter(id => id !== device.id));
                          }
                        }}
                        className="rounded border-slate-600 bg-slate-800 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={`edit-${device.id}`} className="text-sm text-white cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span>{device.deviceId}</span>
                          <Chip size="sm" color={getStatusColor(device.status)}>
                            {device.status}
                          </Chip>
                        </div>
                        <div className="text-xs text-slate-400">{device.location.address}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={onEditClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleUpdateGroup}>
              Update Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 