import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export enum DeviceStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  FAULT = "FAULT"
}

export enum ScheduleMode {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
  TWILIGHT = "TWILIGHT"
}

export enum AlertLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL"
}

export interface Location {
  coordinates: number[];
  address: string;
}

export interface TelemetryData {
  timestamp: Date;
  voltage: number[];
  current: number[];
  power: number[];
  powerFactor: number[];
  temperature: number;
}

export interface CCMSDevice {
  id: string;
  deviceId: string;
  powerRating: string;
  voltage: string;
  frequency: string;
  incomingCurrent: string;
  ipRating: string;
  status: DeviceStatus;
  location: Location;
  telemetry: TelemetryData[];
  alert?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  deviceId: string;
  startTime: Date;
  endTime: Date;
  mode: ScheduleMode;
}

export interface Alert {
  id: string;
  deviceId: string;
  message: string;
  level: AlertLevel;
  createdAt: Date;
}
