"use client";

import React, { useState } from 'react';
import { Schedule as PrismaSchedule, ScheduleMode } from '@prisma/client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // Or use custom refresh function if preferred

interface ScheduleManagerProps {
  deviceId: string;
  schedules: PrismaSchedule[];
  // We might need a way to refresh schedules on the parent page after CUD operations
  // For now, we'll rely on a full page refresh or optimistic updates + parent state management.
  // A simpler approach for now: pass a refresh function or use router.refresh().
  onScheduleUpdate: () => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ deviceId, schedules: initialSchedules, onScheduleUpdate }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PrismaSchedule | null>(null);

  // Form state for new/editing schedule
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [mode, setMode] = useState<ScheduleMode>(ScheduleMode.AUTO);

  const openModalForCreate = () => {
    setEditingSchedule(null);
    // For local datetime-local input, format needs to be YYYY-MM-DDTHH:mm
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
    const defaultStartTime = now.toISOString().slice(0, 16);
    now.setHours(now.getHours() + 1); // Default end time 1 hour later
    const defaultEndTime = now.toISOString().slice(0, 16);

    setStartTime(defaultStartTime);
    setEndTime(defaultEndTime);
    setMode(ScheduleMode.AUTO);
    setIsModalOpen(true);
  };

  const openModalForEdit = (schedule: PrismaSchedule) => {
    setEditingSchedule(schedule);
    // Prisma dates are Date objects or strings; ensure they are formatted for datetime-local input
    const formatDateTimeLocal = (date: Date | string) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Adjust for local timezone
        return d.toISOString().slice(0,16);
    }
    setStartTime(formatDateTimeLocal(schedule.startTime));
    setEndTime(formatDateTimeLocal(schedule.endTime));
    setMode(schedule.mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const scheduleData = {
      startTime: new Date(startTime).toISOString(), // Ensure ISO string for backend
      endTime: new Date(endTime).toISOString(),
      mode,
    };

    try {
      if (editingSchedule) {
        // Update existing schedule
        await axios.put(`/api/devices/${deviceId}/schedules/${editingSchedule.id}`, scheduleData);
        toast.success('Schedule updated successfully!');
      } else {
        // Create new schedule
        await axios.post(`/api/devices/${deviceId}/schedules`, scheduleData);
        toast.success('Schedule created successfully!');
      }
      onScheduleUpdate(); // Notify parent to refresh data
      closeModal();
    } catch (error: any) {
      console.error("Failed to save schedule:", error);
      toast.error(error.response?.data?.error || 'Failed to save schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    setIsLoading(true);
    try {
      await axios.delete(`/api/devices/${deviceId}/schedules/${scheduleId}`);
      toast.success('Schedule deleted successfully!');
      onScheduleUpdate(); // Notify parent to refresh data
    } catch (error: any) {
      console.error("Failed to delete schedule:", error);
      toast.error(error.response?.data?.error || 'Failed to delete schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-neutral-800 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">Device Schedules</h3>
        <button
          onClick={openModalForCreate}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm"
          disabled={isLoading}
        >
          Add New Schedule
        </button>
      </div>

      {initialSchedules.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No schedules defined for this device.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-neutral-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Time</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Time</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mode</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
              {initialSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{new Date(schedule.startTime).toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{new Date(schedule.endTime).toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{schedule.mode}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModalForEdit(schedule)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mode</label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ScheduleMode)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                  required
                >
                  {Object.values(ScheduleMode).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-600 hover:bg-gray-200 dark:hover:bg-neutral-500 rounded-md"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (editingSchedule ? 'Saving...' : 'Creating...') : (editingSchedule ? 'Save Changes' : 'Create Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
