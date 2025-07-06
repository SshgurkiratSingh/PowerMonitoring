"use client";

import { Card, CardHeader, CardBody, Progress, Badge } from "@heroui/react";
import {
  MdDevices,
  MdSpeed,
  MdPower,
  MdSignalWifiStatusbar4Bar,
  MdTrendingUp,
  MdAnalytics,
} from "react-icons/md";
import { IoFlash } from "react-icons/io5";
import { FleetOverview as FleetOverviewType } from "@/types";

interface FleetOverviewProps {
  data: FleetOverviewType;
}

export default function FleetOverview({ data }: FleetOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Main Fleet Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Power */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdPower className="w-6 h-6" />
              <span className="text-sm font-medium">Total Power</span>
            </div>
            <MdTrendingUp className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">
              {data.powerConsumption?.toFixed(1) || 0} kW
            </div>
            <Progress
              value={Math.min(((data.powerConsumption || 0) / 100) * 100, 100)}
              color="warning"
              className="mt-2"
              size="sm"
            />
            <p className="text-xs opacity-90 mt-1">Live consumption</p>
          </CardBody>
        </Card>

        {/* Network Health */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdSignalWifiStatusbar4Bar className="w-6 h-6" />
              <span className="text-sm font-medium">Network Health</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">
              {data.networkHealth?.toFixed(1) || 0}%
            </div>
            <Progress
              value={data.networkHealth || 0}
              color="success"
              className="mt-2"
              size="sm"
            />
            <p className="text-xs opacity-90 mt-1">
              {data.onlinePercentage?.toFixed(1) || 0}% online
            </p>
          </CardBody>
        </Card>

        {/* Energy Savings */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <IoFlash className="w-6 h-6" />
              <span className="text-sm font-medium">Energy Savings</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">
              {data.energySavings?.toFixed(1) || 0} kWh
            </div>
            <p className="text-xs opacity-90 mt-1">This month</p>
          </CardBody>
        </Card>

        {/* Total Panels */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdDevices className="w-6 h-6" />
              <span className="text-sm font-medium">Total Panels</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-3xl font-bold">{data.totalPanels || 0}</div>
            <p className="text-xs opacity-90 mt-1">Installed devices</p>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Fleet Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdDevices className="w-6 h-6" />
              <span className="text-sm font-medium">Total Panels</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-2xl font-bold">{data.totalPanels || 0}</div>
            <p className="text-xs opacity-90 mt-1">Installed devices</p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdSpeed className="w-6 h-6" />
              <span className="text-sm font-medium">Total Feeders</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-2xl font-bold">{data.totalFeeders || 0}</div>
            <p className="text-xs opacity-90 mt-1">Power distribution</p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MdPower className="w-6 h-6" />
              <span className="text-sm font-medium">Total Lights</span>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-2xl font-bold">{data.totalLights || 0}</div>
            <p className="text-xs opacity-90 mt-1">Individual lights</p>
          </CardBody>
        </Card>
      </div>

      {/* System Status Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MdAnalytics className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Fleet Status Summary</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.onlinePercentage?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-default-500">Online Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {data.networkHealth?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-default-500">Network Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {data.powerConsumption?.toFixed(1) || 0} kW
              </div>
              <div className="text-sm text-default-500">Power Consumption</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger">
                {data.energySavings?.toFixed(1) || 0} kWh
              </div>
              <div className="text-sm text-default-500">Energy Saved</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 