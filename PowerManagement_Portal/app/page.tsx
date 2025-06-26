"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SudoModal } from "@/components/sudo-modal";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
});

export default function Home() {
  const [stats, setStats] = useState({
    totalPanels: 0,
    onlinePanels: 0,
    faultPanels: 0,
    totalPower: 0,
  });
  const [showSudoModal, setShowSudoModal] = useState(false);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyShutdown = () => {
    setShowSudoModal(true);
  };

  const handleSudoConfirm = async (success: boolean) => {
    if (success) {
      try {
        await fetch("/api/devices/emergency-shutdown", {
          method: "POST",
        });
        // Handle successful shutdown
      } catch (error) {
        console.error("Emergency shutdown failed:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Total Panels</h3>
            <p className="text-3xl font-bold text-sky-400">{stats.totalPanels}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Online Panels</h3>
            <p className="text-3xl font-bold text-green-400">{stats.onlinePanels}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Fault Panels</h3>
            <p className="text-3xl font-bold text-red-400">{stats.faultPanels}</p>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-2">Total Power</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.totalPower} kW</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-4">Device Map</h3>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapComponent />
            </div>
          </CardBody>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-4">
              <Button
                color="primary"
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600"
              >
                Schedule Update
              </Button>
              <Button
                color="warning"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600"
              >
                System Diagnostics
              </Button>
              <Button
                color="danger"
                className="w-full bg-gradient-to-r from-red-500 to-rose-600"
                onClick={handleEmergencyShutdown}
              >
                Emergency Shutdown
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <SudoModal
        isOpen={showSudoModal}
        onClose={() => setShowSudoModal(false)}
        onConfirm={handleSudoConfirm}
      />
    </div>
  );
}