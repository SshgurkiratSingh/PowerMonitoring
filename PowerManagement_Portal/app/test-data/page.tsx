"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

export default function TestDataPage() {
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/test-data/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Test data generated successfully!");
      } else {
        throw new Error("Failed to generate test data");
      }
    } catch (error) {
      console.error("Error generating test data:", error);
      alert("Failed to generate test data");
    } finally {
      setIsSubmitting(false);
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
                selectedKeys={[formData.status]}
                onSelectionChange={(keys) => {
                  const [status] = Array.from(keys);
                  if (typeof status === "string") {
                    setFormData({ ...formData, status });
                  }
                }}
                className="text-white"
                classNames={{
                  label: "text-slate-400",
                  trigger: "bg-slate-800/50 border-slate-700",
                }}
              >
                <SelectItem key="ONLINE">Online</SelectItem>
                <SelectItem key="OFFLINE">Offline</SelectItem>
                <SelectItem key="FAULT">Fault</SelectItem>
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
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white disabled:opacity-60"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Generating..." : "Generate Test Data"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}