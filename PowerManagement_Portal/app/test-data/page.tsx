"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { SudoModal } from "@/components/sudo-modal";

export default function TestDataPage() {
  const [showSudoModal, setShowSudoModal] = useState(false);
  const [formData, setFormData] = useState({
    deviceCount: "1",
    powerRating: "20",
    status: "ONLINE",
    location: {
      latitude: "51.505",
      longitude: "-0.09",
      address: "Sample Address",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSudoModal(true);
  };

  const handleSudoConfirm = async (success: boolean) => {
    if (success) {
      try {
        const response = await fetch("/api/test-data/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // Handle success
          alert("Test data generated successfully!");
        } else {
          throw new Error("Failed to generate test data");
        }
      } catch (error) {
        console.error("Error generating test data:", error);
        alert("Failed to generate test data");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto bg-slate-900/70 backdrop-blur-md border border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">Generate Test Data</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="number"
                label="Number of Devices"
                value={formData.deviceCount}
                onChange={(e) =>
                  setFormData({ ...formData, deviceCount: e.target.value })
                }
                min="1"
                max="100"
                className="text-white"
                classNames={{
                  label: "text-slate-400",
                  input: "bg-slate-800/50 border-slate-700",
                }}
              />
            </div>

            <div>
              <Input
                type="number"
                label="Power Rating (kW)"
                value={formData.powerRating}
                onChange={(e) =>
                  setFormData({ ...formData, powerRating: e.target.value })
                }
                className="text-white"
                classNames={{
                  label: "text-slate-400",
                  input: "bg-slate-800/50 border-slate-700",
                }}
              />
            </div>

            <div>
              <Select
                label="Device Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="text-white"
                classNames={{
                  label: "text-slate-400",
                  trigger: "bg-slate-800/50 border-slate-700",
                }}
              >
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
                <SelectItem value="FAULT">Fault</SelectItem>
              </Select>
            </div>

            <div>
              <Input
                type="text"
                label="Location (Latitude)"
                value={formData.location.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, latitude: e.target.value },
                  })
                }
                className="text-white"
                classNames={{
                  label: "text-slate-400",
                  input: "bg-slate-800/50 border-slate-700",
                }}
              />
            </div>

            <div>
              <Input
                type="text"
                label="Location (Longitude)"
                value={formData.location.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, longitude: e.target.value },
                  })
                }
                className="text-white"
                classNames={{
                  label: "text-slate-400",
                  input: "bg-slate-800/50 border-slate-700",
                }}
              />
            </div>

            <div>
              <Input
                type="text"
                label="Address"
                value={formData.location.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value },
                  })
                }
                className="text-white"
                classNames={{
                  label: "text-slate-400",
                  input: "bg-slate-800/50 border-slate-700",
                }}
              />
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white"
            >
              Generate Test Data
            </Button>
          </form>
        </CardBody>
      </Card>

      <SudoModal
        isOpen={showSudoModal}
        onClose={() => setShowSudoModal(false)}
        onConfirm={handleSudoConfirm}
      />
    </div>
  );
}