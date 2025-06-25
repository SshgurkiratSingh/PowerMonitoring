"use client";

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ManualControlsProps {
  deviceId: string; // Database ID of the CCMSDevice
  deviceUniqueId: string; // User-facing Device ID (e.g., CCMS001)
}

const ManualControls: React.FC<ManualControlsProps> = ({ deviceId, deviceUniqueId }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null); // Store the command being processed

  const sendCommand = async (command: string, payload?: any) => {
    setIsLoading(command); // Set loading state for this specific command
    try {
      const response = await axios.post(`/api/devices/${deviceId}/control`, { command, payload });
      toast.success(response.data.message || `Command '${command}' executed successfully!`);
    } catch (error: any) {
      console.error(`Failed to execute command ${command}:`, error);
      toast.error(error.response?.data?.error || `Failed to execute command '${command}'.`);
    } finally {
      setIsLoading(null); // Clear loading state
    }
  };

  // Example control actions
  const handleTurnAllOn = () => {
    sendCommand("SET_ALL_CIRCUITS", { state: "ON" });
  };

  const handleTurnAllOff = () => {
    sendCommand("SET_ALL_CIRCUITS", { state: "OFF" });
  };

  const handleSetBrightness = (level: number) => {
    sendCommand("SET_BRIGHTNESS_ALL", { level });
  };

  const handleForceStatusUpdate = () => {
    sendCommand("REQUEST_STATUS_UPDATE");
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-neutral-800 shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">
        Manual Controls for {deviceUniqueId}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Basic On/Off */}
        <button
          onClick={handleTurnAllOn}
          disabled={!!isLoading}
          className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading === "SET_ALL_CIRCUITS" && payload?.state === "ON" ? 'Processing...' : 'Turn All Lights ON'}
        </button>
        <button
          onClick={handleTurnAllOff}
          disabled={!!isLoading}
          className="w-full px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading === "SET_ALL_CIRCUITS" && payload?.state === "OFF" ? 'Processing...' : 'Turn All Lights OFF'}
        </button>

        {/* Brightness Example (could be a slider in a real app) */}
        <div className="space-y-2">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">Set Brightness:</p>
            <div className="flex gap-2">
                <button
                onClick={() => handleSetBrightness(50)}
                disabled={!!isLoading}
                className="w-full px-3 py-2 bg-sky-500 text-white text-xs rounded-md hover:bg-sky-600 transition disabled:opacity-50"
                >
                {isLoading === "SET_BRIGHTNESS_ALL" && payload?.level === 50 ? '...' : '50%'}
                </button>
                <button
                onClick={() => handleSetBrightness(100)}
                disabled={!!isLoading}
                className="w-full px-3 py-2 bg-sky-500 text-white text-xs rounded-md hover:bg-sky-600 transition disabled:opacity-50"
                >
                {isLoading === "SET_BRIGHTNESS_ALL" && payload?.level === 100 ? '...' : '100%'}
                </button>
            </div>
        </div>

        {/* More generic command example */}
        <button
          onClick={handleForceStatusUpdate}
          disabled={!!isLoading}
          className="w-full px-4 py-3 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading === "REQUEST_STATUS_UPDATE" ? 'Processing...' : 'Force Status Update'}
        </button>

        {/* Placeholder for more controls */}
        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center min-h-[50px]">
            <p className="text-sm text-gray-400 dark:text-gray-500">More controls can be added here.</p>
        </div>

      </div>
      {isLoading && (
        <p className="text-sm text-center mt-4 text-blue-500 dark:text-blue-400">
          Sending command: {isLoading}... Please wait.
        </p>
      )}
       <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Note: These controls simulate sending commands to the device. Actual device response depends on its capabilities and connection.
      </p>
    </div>
  );
};

export default ManualControls;
