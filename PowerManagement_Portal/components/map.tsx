"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import {
  MdLocationOn,
  MdRefresh,
  MdError,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md";
import type LType from "leaflet";

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

export default function MapComponent() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LType.Map | null>(null);
  const markersRef = useRef<LType.Marker[]>([]);
  const tileLayerRef = useRef<LType.TileLayer | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (typeof window === "undefined") return;
        const leaflet = await import("leaflet");
        if (!mounted) return;
        L.current = leaflet;
        // Fix default marker icons
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        setLeafletLoaded(true);
        console.log("✅ Leaflet loaded successfully");
      } catch (err) {
        console.error("❌ Failed to load Leaflet:", err);
        if (mounted) setError("Failed to load map library");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch device locations
  const fetchDeviceLocations = async () => {
    try {
      const res = await fetch("/api/devices/locations");
      if (!res.ok) throw new Error("Failed to fetch device locations");
      const data: MapData = await res.json();
      setMapData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Initialize map once Leaflet is loaded
  useLayoutEffect(() => {
    if (!leafletLoaded || !mapRef.current || !L.current || mapInstance.current)
      return;
    let mounted = true;

    const initMap = () => {
      console.log("🗺️ Initializing map...");
      const leaflet = L.current!;
      const map = leaflet.map(mapRef.current!, {
        center: [30.7333, 76.7794],
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
        preferCanvas: true,
      });
      mapInstance.current = map;

      // Handle map-ready state via dataloading/dataload
      map
        .on("dataloading", () => {
          console.log("🔄 Tiles loading...");
          setMapReady(false);
        })
        .on("dataload", () => {
          console.log("✅ Tiles all loaded");
          setMapReady(true);
          // Force resize after load
          setTimeout(() => map.invalidateSize(true), 100);
        })
        .whenReady(() => {
          console.log("🗺️ Map initial ready");
          setMapReady(true);
          setTimeout(() => map.invalidateSize(true), 100);
        });

      // Create tile layer
      tileLayerRef.current = leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(map);

      console.log("✅ Map initialization complete");
    };

    // Delay to ensure container has size
    const timer = setTimeout(initMap, 50);
    return () => {
      mounted = false;
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        tileLayerRef.current = null;
        setMapReady(false);
      }
    };
  }, [leafletLoaded]);

  // Add markers when data or readiness changes
  useEffect(() => {
    const map = mapInstance.current;
    const leaflet = L.current;
    if (!map || !leaflet || !mapData?.devices || !mapReady) return;

    // Remove existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Add new markers
    mapData.devices.forEach((dev) => {
      const [lng, lat] = dev.coordinates;
      if (isNaN(lat) || isNaN(lng)) return;
      const marker = leaflet.marker([lat, lng]);
      marker
        .bindPopup(
          `<div style="min-width:200px">
             <h3>${dev.deviceId}</h3>
             <div>Status: ${dev.status}</div>
             <div>Address: ${dev.address}</div>
             <div>Power: ${dev.currentPower.toFixed(1)} kW</div>
             <div>Rating: ${dev.powerRating}</div>
             ${
               dev.temperature != null
                 ? `<div>Temp: ${dev.temperature.toFixed(1)}°C</div>`
                 : ""
             }
           </div>`
        )
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Fit to markers
    if (markersRef.current.length) {
      const group = leaflet.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds(), { padding: [20, 20], maxZoom: 15 });
    }
  }, [mapData, mapReady]);

  // Fetch on mount and every minute
  useEffect(() => {
    fetchDeviceLocations();
    const interval = setInterval(fetchDeviceLocations, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstance.current && mapReady) {
        setTimeout(() => mapInstance.current!.invalidateSize(true), 200);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mapReady]);

  // Render loading or error
  if (loading || !leafletLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-white text-sm">
            {!leafletLoaded ? "Loading map library..." : "Loading map..."}
          </p>
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
              setMapReady(false);
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

  // Render map
  return (
    <div className="w-full h-full relative">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{
          minHeight: "400px",
          position: "relative",
          backgroundColor: "#f0f0f0",
          zIndex: 0,
        }}
      />
      {/* Overlay while tiles are loading */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-white text-sm">Loading map tiles...</div>
          </div>
        </div>
      )}

      {/* Top-right control */}
      <div className="absolute top-2 right-2 z-[1000]">
        <Card className="bg-slate-900/90 backdrop-blur-sm border border-slate-700">
          <CardBody className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white text-sm">
              <MdLocationOn />
              <span>{mapData?.devices?.length ?? 0} devices</span>
            </div>
            <Button size="sm" variant="light" onClick={fetchDeviceLocations}>
              <MdRefresh />
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Bottom-left status */}
      {mapData?.devices && (
        <div className="absolute bottom-2 left-2 z-[1000]">
          <Card className="bg-slate-900/90 backdrop-blur-sm border border-slate-700">
            <CardBody className="p-3 flex space-x-4 text-sm text-white">
              <div className="flex items-center space-x-1">
                <MdCheckCircle className="text-green-400" />
                <span>
                  {mapData.devices.filter((d) => d.status === "ONLINE").length}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MdWarning className="text-yellow-400" />
                <span>
                  {mapData.devices.filter((d) => d.status === "OFFLINE").length}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MdError className="text-red-400" />
                <span>
                  {mapData.devices.filter((d) => d.status === "FAULT").length}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
