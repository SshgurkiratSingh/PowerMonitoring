"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import {
  MdLocationOn,
  MdRefresh,
  MdError,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md";
import { Map, Marker, Overlay } from "pigeon-maps";

interface DeviceLocation {
  id: string;
  deviceId: string;
  status: "ONLINE" | "OFFLINE" | "FAULT";
  coordinates: [number, number];
  address: string;
  powerRating: string;
  currentPower: number;
  temperature: number | null;
  alertLevel: string | null;
}

interface MapData {
  devices: DeviceLocation[];
  total: number;
  timestamp: string;
}

// Custom marker component
const CustomMarker = ({
  status,
  onClick,
  device,
}: {
  status: string;
  onClick: () => void;
  device: DeviceLocation;
}) => {
  const getMarkerColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "#4ade80"; // green
      case "OFFLINE":
        return "#facc15"; // yellow
      case "FAULT":
        return "#f87171"; // red
      default:
        return "#60a5fa"; // blue
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: getMarkerColor(status),
        border: "3px solid white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};

// Popup component
const DevicePopup = ({
  device,
  onClose,
}: {
  device: DeviceLocation;
  onClose: () => void;
}) => {
  return (
    <div
      style={{
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        border: "1px solid #e5e7eb",
        minWidth: "200px",
        transform: "translate(-50%, -100%)",
        marginTop: "-10px",
        position: "relative",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          background: "none",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          color: "#666",
          padding: "4px",
        }}
      >
        ×
      </button>

      {/* Arrow pointing down */}
      <div
        style={{
          position: "absolute",
          bottom: "-8px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid white",
        }}
      />

      <div>
        <h3
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#1f2937",
            fontSize: "14px",
          }}
        >
          {device.deviceId}
        </h3>
        <div style={{ fontSize: "12px", color: "#4b5563" }}>
          <div style={{ marginBottom: "4px" }}>
            Status:{" "}
            <span
              style={{
                fontWeight: "bold",
                color:
                  device.status === "ONLINE"
                    ? "#059669"
                    : device.status === "OFFLINE"
                      ? "#d97706"
                      : "#dc2626",
              }}
            >
              {device.status}
            </span>
          </div>
          <div style={{ marginBottom: "4px" }}>Address: {device.address}</div>
          <div style={{ marginBottom: "4px" }}>
            Power: {device.currentPower.toFixed(1)} kW
          </div>
          <div style={{ marginBottom: "4px" }}>
            Rating: {device.powerRating}
          </div>
          {device.temperature != null && (
            <div>Temp: {device.temperature.toFixed(1)}°C</div>
          )}
        </div>
      </div>
    </div>
  );
};

const initialCenter: [number, number] = [30.7333, 76.7794];
const initialZoom = 10;

export default function MapComponent() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceLocation | null>(
    null
  );
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);

  // Fetch device locations from API
  const fetchDeviceLocations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/devices/locations");
      if (!res.ok) throw new Error("Failed to fetch device locations");
      const data: MapData = await res.json();
      setMapData(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate center and zoom to fit all devices
  const fitToDevices = useCallback(() => {
    // Always center to Chandigarh
    setCenter([30.7333, 76.7794]);
    setZoom(12);
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchDeviceLocations();
    const id = setInterval(fetchDeviceLocations, 60000);
    return () => clearInterval(id);
  }, []);

  // Fit to devices when data changes
  useEffect(() => {
    if (mapData?.devices && mapData.devices.length > 0) {
      fitToDevices();
    }
  }, [mapData, fitToDevices]);

  // Handle marker click
  const handleMarkerClick = (device: DeviceLocation) => {
    setSelectedDevice(device);
  };

  // Handle popup close
  const handlePopupClose = () => {
    setSelectedDevice(null);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
          <p className="text-white text-sm">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center">
          <MdError className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-white text-sm">Map Error: {error}</p>
          <Button
            size="sm"
            color="primary"
            onClick={() => {
              setError(null);
              fetchDeviceLocations();
            }}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ minHeight: 400 }}>
      <div
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          height={400}
          dprs={[1, 2]} // Support for high DPI displays
        >
          {/* Device markers */}
          {mapData?.devices.map((device) => {
            const [lng, lat] = device.coordinates;
            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker
                key={device.id}
                anchor={[lat, lng]}
                payload={device}
                onClick={() => handleMarkerClick(device)}
              >
                <CustomMarker
                  status={device.status}
                  onClick={() => handleMarkerClick(device)}
                  device={device}
                />
              </Marker>
            );
          })}

          {/* Popup overlay */}
          {selectedDevice && (
            <Overlay
              anchor={[
                selectedDevice.coordinates[1],
                selectedDevice.coordinates[0],
              ]}
              offset={[0, -10]}
            >
              <DevicePopup device={selectedDevice} onClose={handlePopupClose} />
            </Overlay>
          )}
        </Map>
      </div>

      {/* Top-right devices count & refresh */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Card className="bg-slate-900/90 backdrop-blur-sm border border-slate-700">
          <CardBody className="p-3 flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-2">
              <MdLocationOn />
              <span>{mapData?.devices.length ?? 0} devices</span>
            </div>
            <Button size="sm" variant="light" onClick={fetchDeviceLocations}>
              <MdRefresh />
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Bottom-left status summary */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="bg-slate-900/90 backdrop-blur-sm border border-slate-700">
          <CardBody className="p-3 flex space-x-4 text-sm text-white">
            <div className="flex items-center space-x-1">
              <MdCheckCircle className="text-green-400" />
              <span>
                {mapData?.devices.filter((d) => d.status === "ONLINE").length ||
                  0}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <MdWarning className="text-yellow-400" />
              <span>
                {mapData?.devices.filter((d) => d.status === "OFFLINE")
                  .length || 0}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <MdError className="text-red-400" />
              <span>
                {mapData?.devices.filter((d) => d.status === "FAULT").length ||
                  0}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Fit to devices button */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Button
          size="sm"
          color="primary"
          onClick={fitToDevices}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Fit All
        </Button>
      </div>
    </div>
  );
}
