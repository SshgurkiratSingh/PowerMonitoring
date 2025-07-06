"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import {
  MdLocationOn,
  MdRefresh,
  MdError,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

const initialCenter: [number, number] = [30.7333, 76.7794];
const initialZoom = 10;

// Custom marker icons based on status
const createCustomIcon = (status: string) => {
  const color = getMarkerColor(status);
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Get marker color based on device status
const getMarkerColor = (status: string) => {
  switch (status) {
    case "ONLINE":
      return "#4ade80";
    case "OFFLINE":
      return "#facc15";
    case "FAULT":
      return "#f87171";
    default:
      return "#60a5fa";
  }
};

// Component to handle map bounds fitting
function MapBoundsHandler({ devices }: { devices: DeviceLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (devices && devices.length > 0) {
      const validDevices = devices.filter((device) => {
        const [lng, lat] = device.coordinates;
        return !isNaN(lat) && !isNaN(lng);
      });

      if (validDevices.length > 0) {
        const bounds = L.latLngBounds(
          validDevices.map((device) => [
            device.coordinates[1],
            device.coordinates[0],
          ])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [devices, map]);

  return null;
}

interface LeafletMapProps {
  mapData: MapData | null;
  onRefresh: () => void;
}

export default function LeafletMap({ mapData, onRefresh }: LeafletMapProps) {
  return (
    <div className="w-full h-full relative" style={{ minHeight: 400 }}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
        className="leaflet-container"
        key="map-container" // Add key to force re-render if needed
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapData?.devices.map((device) => {
          const [lng, lat] = device.coordinates;
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={device.id}
              position={[lat, lng]}
              icon={createCustomIcon(device.status)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold mb-2 text-gray-900">
                    {device.deviceId}
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      Status:{" "}
                      <span
                        className={`font-semibold ${
                          device.status === "ONLINE"
                            ? "text-green-600"
                            : device.status === "OFFLINE"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {device.status}
                      </span>
                    </div>
                    <div>Address: {device.address}</div>
                    <div>Power: {device.currentPower.toFixed(1)} kW</div>
                    <div>Rating: {device.powerRating}</div>
                    {device.temperature != null && (
                      <div>Temp: {device.temperature.toFixed(1)}°C</div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapBoundsHandler devices={mapData?.devices || []} />
      </MapContainer>

      {/* Top-right devices count & refresh */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Card className="bg-slate-900/90 backdrop-blur-sm border border-slate-700">
          <CardBody className="p-3 flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-2">
              <MdLocationOn />
              <span>{mapData?.devices.length ?? 0} devices</span>
            </div>
            <Button size="sm" variant="light" onClick={onRefresh}>
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
    </div>
  );
}
