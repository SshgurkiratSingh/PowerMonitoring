"use client";

import React from 'react';

interface DeviceLocationInfo {
  id: string; // DB ID
  deviceId: string; // Business ID
  coordinates: [number, number]; // [longitude, latitude]
  status: string;
  alert?: string | null;
}

import { useRouter } from "next/navigation";

interface MapPlaceholderProps {
  devices: DeviceLocationInfo[];
  // onMarkerClick?: (deviceId: string) => void; // DB ID - Removing as component will handle its own navigation
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ devices }) => {
  const router = useRouter();

  const handleDeviceClick = (dbId: string) => {
    router.push(`/devices/${dbId}`);
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50 dark:bg-neutral-700">
      <h3 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
        Interactive Map Placeholder
      </h3>
      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
        (Actual map integration requires running: <code>npm install react-leaflet leaflet @types/leaflet</code>)
      </p>
      {devices && devices.length > 0 ? (
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Received {devices.length} device locations:</p>
          <ul className="max-h-48 overflow-y-auto text-xs space-y-1">
            {devices.map((device) => (
              <li key={device.id} className="p-1 bg-gray-100 dark:bg-neutral-600 rounded">
                <strong>{device.deviceId}</strong> (Status: {device.status})
                at [{device.coordinates[1].toFixed(4)}, {device.coordinates[0].toFixed(4)}] {/* Lat, Lon display */}
                {device.alert && <span className="text-red-500 ml-2">Alert!</span>}
                <button
                  onClick={() => handleDeviceClick(device.id)}
                  className="ml-2 text-blue-500 hover:underline text-xs"
                >
                  (View Details)
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">No device locations to display.</p>
      )}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
        An actual map would display these as markers. Clicking a marker would typically show a popup and link to the device details page.
      </p>
    </div>
  );
};

export default MapPlaceholder;
