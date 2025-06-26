"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Map = () => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([51.505, -0.09], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Fetch and add device markers
      fetch("/api/devices/locations")
        .then(response => response.json())
        .then(devices => {
          devices.forEach((device: any) => {
            const marker = L.marker([
              device.location.coordinates[1],
              device.location.coordinates[0]
            ]).addTo(mapRef.current!);

            marker.bindPopup(`
              <div class="p-2">
                <h3 class="font-bold">${device.deviceId}</h3>
                <p>Status: ${device.status}</p>
                <p>Power: ${device.powerRating}</p>
              </div>
            `);
          });
        })
        .catch(error => console.error("Error loading device locations:", error));
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div id="map" className="h-full w-full rounded-lg" />
  );
};

export default Map;