import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export enum DeviceStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  FAULT = "FAULT",
  MAINTENANCE = "MAINTENANCE"
}

export enum ScheduleMode {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
  TWILIGHT = "TWILIGHT",
  ASTRONOMICAL = "ASTRONOMICAL",
  SUNRISE_SUNSET = "SUNRISE_SUNSET"
}

export enum ScheduleType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  CUSTOM = "CUSTOM",
  HOLIDAY = "HOLIDAY"
}

export enum AlertLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
  EMERGENCY = "EMERGENCY"
}

export enum AlertType {
  VOLTAGE_HIGH = "VOLTAGE_HIGH",
  VOLTAGE_LOW = "VOLTAGE_LOW",
  CURRENT_HIGH = "CURRENT_HIGH",
  TEMPERATURE_HIGH = "TEMPERATURE_HIGH",
  POWER_FACTOR_LOW = "POWER_FACTOR_LOW",
  OVERLOAD = "OVERLOAD",
  FEEDER_TRIP = "FEEDER_TRIP",
  RTC_DRIFT = "RTC_DRIFT",
  DOOR_OPEN = "DOOR_OPEN",
  AC_POWER_LOSS = "AC_POWER_LOSS",
  COMMUNICATION_LOSS = "COMMUNICATION_LOSS",
  PHASE_FAULT = "PHASE_FAULT",
  GENERAL_FAULT = "GENERAL_FAULT"
}

export enum CommandType {
  POWER_ON = "POWER_ON",
  POWER_OFF = "POWER_OFF",
  DIMMING = "DIMMING",
  SCHEDULE_OVERRIDE = "SCHEDULE_OVERRIDE",
  RESET = "RESET",
  DIAGNOSTIC = "DIAGNOSTIC",
  CONFIG_UPDATE = "CONFIG_UPDATE"
}

export enum CommandStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  EXECUTED = "EXECUTED",
  FAILED = "FAILED",
  TIMEOUT = "TIMEOUT"
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
  totalPower: number;
  totalEnergy: number;
  frequency: number;
  phaseStatus: boolean[];
  doorStatus?: boolean;
  acPowerStatus?: boolean;
  rtcDrift?: number;
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
  deviceGroup?: DeviceGroup;
  groupId?: string;
  alertThresholds: AlertThreshold[];
  commands: Command[];
  isOn: boolean;
  lastCommand?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  devices: CCMSDevice[];
  commands: Command[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  deviceId?: string;
  groupId?: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  mode: ScheduleMode;
  type: ScheduleType;
  daysOfWeek: number[];
  isActive: boolean;
  isHoliday: boolean;
  holidayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  deviceId: string;
  message: string;
  level: AlertLevel;
  type: AlertType;
  value?: number;
  threshold?: number;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface AlertThreshold {
  id: string;
  deviceId: string;
  type: AlertType;
  minValue?: number;
  maxValue?: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Command {
  id: string;
  deviceId?: string;
  groupId?: string;
  type: CommandType;
  value: string;
  status: CommandStatus;
  sentAt: Date;
  executedAt?: Date;
  response?: string;
  error?: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}

// Dashboard specific interfaces
export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  faultDevices: number;
  maintenanceDevices: number;
  totalPower: number;
  totalEnergy: number;
  activeAlerts: number;
  criticalAlerts: number;
  deviceGroups: number;
  activeSchedules: number;
  networkHealth: number; // Percentage
  timestamp: Date;
}

export interface EnergyAnalytics {
  currentPower: number;
  totalEnergy: number;
  voltage: number[];
  current: number[];
  powerFactor: number[];
  temperature: number;
  frequency: number;
  phaseStatus: boolean[];
  timestamp: Date;
}

export interface FleetOverview {
  totalPanels: number;
  totalFeeders: number;
  totalLights: number;
  onlinePercentage: number;
  networkHealth: number;
  powerConsumption: number;
  energySavings: number;
  lastUpdate: Date;
}
