# CCMS Realtime Dashboard and API Implementation

This change implements the real-time dashboard and all required API endpoints for the CCMS system.

## API Endpoints

### Devices

1. `GET /api/devices`
   - Returns all devices with their telemetry and latest alert
   - Response: `{ devices: CCMSDevice[] }`

2. `POST /api/devices`
   - Creates a new device
   - Body: `CCMSDevice`
   - Response: `{ device: CCMSDevice }`

### Device Telemetry

3. `POST /api/devices/[deviceId]/telemetry`
   - Reports telemetry data for a specific device
   - Body: `TelemetryData`
   - Response: `{ success: boolean }`

### Device Alerts

4. `POST /api/devices/[deviceId]/alerts`
   - Reports an alert for a specific device
   - Body: `{ message: string, level: AlertLevel }`
   - Response: `{ alert: Alert }`

### Device Schedules

5. `GET /api/devices/[deviceId]/schedules`
   - Gets all schedules for a specific device
   - Response: `{ schedules: Schedule[] }`

6. `POST /api/devices/[deviceId]/schedules`
   - Creates a new schedule for a specific device
   - Body: `{ startTime: Date, endTime: Date, mode: ScheduleMode }`
   - Response: `{ schedule: Schedule }`

### Dashboard

7. `GET /api/dashboard/stats`
   - Gets dashboard statistics
   - Response: `{ totalDevices: number, onlineDevices: number, activeAlerts: number, totalPowerConsumption: number }`

8. `GET /api/devices/locations`
   - Gets all device locations for the map
   - Response: `{ devices: { deviceId: string, location: Location, status: DeviceStatus }[] }`

## Changes Made

1. Added type definitions in `/types/index.ts`
2. Implemented all required API endpoints
3. Updated dashboard to use real-time data with 5-second polling
4. Added proper error handling and type safety
5. Implemented proper MongoDB integration through Prisma

## Features

- Real-time device monitoring
- Device telemetry reporting
- Alert management
- Schedule management
- Dashboard statistics
- Device location mapping
- Dark theme with glassmorphism effects
- Responsive design
- Accessibility support

## Technical Details

- Uses HeroUI components for UI elements
- Implements Tailwind CSS for styling
- Features modern glassmorphism effects and gradients
- Real-time updates every 5 seconds
- MongoDB integration through Prisma
- Type-safe implementation with TypeScript
- RESTful API design
- Error handling and validation