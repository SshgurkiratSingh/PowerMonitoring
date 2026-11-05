# CCMS API Documentation

## Device Management APIs

### Get All Devices
- **Endpoint**: `GET /api/devices`
- **Description**: Retrieve all CCMS devices with their current status and telemetry
- **Response**: Array of device objects with current power, temperature, and alerts

### Add New Device
- **Endpoint**: `POST /api/devices`
- **Description**: Create a new CCMS device
- **Body**:
```json
{
  "deviceId": "string",
  "powerRating": "string",
  "voltage": "string", 
  "frequency": "string",
  "incomingCurrent": "string",
  "ipRating": "string",
  "coordinates": [number, number],
  "address": "string"
}
```
- **Response**: Created device object

### Get Device Details
- **Endpoint**: `GET /api/devices/[deviceId]`
- **Description**: Retrieve detailed information about a specific CCMS device
- **Response**: Device object with telemetry, alerts, and schedules

### Update Device
- **Endpoint**: `PUT /api/devices/[deviceId]`
- **Description**: Update device information
- **Body**:
```json
{
  "deviceId": "string",
  "powerRating": "string",
  "voltage": "string", 
  "frequency": "string",
  "incomingCurrent": "string",
  "ipRating": "string",
  "status": "ONLINE|OFFLINE|FAULT",
  "location": {
    "coordinates": [number, number],
    "address": "string"
  }
}
```

## Telemetry APIs

### Post Telemetry Data (Enhanced)
- **Endpoint**: `POST /api/telemetry/post`
- **Description**: Post telemetry data with support for extra JSON data
- **Body**:
```json
{
  "deviceId": "string",
  "telemetry": {
    "voltage": [number, number, number],
    "current": [number, number, number], 
    "power": [number, number, number],
    "powerFactor": [number, number, number],
    "temperature": number,
    "extraData": {
      "customField1": "value1",
      "customField2": "value2",
      "sensorData": {
        "humidity": 45.2,
        "pressure": 1013.25
      }
    }
  }
}
```

### Report Telemetry Data (Legacy)
- **Endpoint**: `POST /api/telemetry/report`
- **Description**: Legacy telemetry reporting endpoint
- **Body**: Same as above but without `extraData` support

## Device Updates API

### Get Device Updates
- **Endpoint**: `GET /api/devices/[deviceId]/updates`
- **Description**: Get schedules, alerts, and configuration updates for a device
- **Response**:
```json
{
  "deviceId": "string",
  "status": "ONLINE|OFFLINE|FAULT",
  "lastUpdate": "2024-01-01T00:00:00Z",
  "schedules": [
    {
      "id": "string",
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-01-01T23:59:59Z", 
      "mode": "AUTO|MANUAL|TWILIGHT"
    }
  ],
  "recentAlerts": [
    {
      "id": "string",
      "message": "string",
      "level": "INFO|WARNING|CRITICAL",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "deviceConfig": {
    "powerRating": "string",
    "voltage": "string",
    "frequency": "string", 
    "incomingCurrent": "string",
    "ipRating": "string",
    "location": {
      "coordinates": [number, number],
      "address": "string"
    }
  },
  "systemSettings": {
    "maintenanceMode": boolean,
    "globalScheduleEnabled": boolean,
    "alertThresholds": {
      "temperature": number,
      "powerFactor": number,
      "voltage": {
        "min": number,
        "max": number
      }
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Acknowledge Device Updates
- **Endpoint**: `POST /api/devices/[deviceId]/updates`
- **Description**: Device acknowledges receipt of updates
- **Body**:
```json
{
  "acknowledgedSchedules": ["scheduleId1", "scheduleId2"],
  "acknowledgedAlerts": ["alertId1", "alertId2"],
  "deviceStatus": "ONLINE|OFFLINE|FAULT"
}
```

## Frontend Pages

### Device Edit Page
- **Route**: `/devices/[deviceId]`
- **Features**:
  - Edit device information (power rating, voltage, frequency, etc.)
  - View telemetry data with extra JSON data support
  - Update device location coordinates
  - Change device status
  - View detailed telemetry readings in a modal

## Usage Examples

### Adding a New Device
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "CCMS-001",
    "powerRating": "50kW",
    "voltage": "415V",
    "frequency": "50Hz",
    "incomingCurrent": "48A",
    "ipRating": "IP65",
    "coordinates": [77.2090, 28.6139],
    "address": "Delhi, India"
  }'
```

### Posting Telemetry with Extra Data
```bash
curl -X POST http://localhost:3000/api/telemetry/post \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "CCMS-001",
    "telemetry": {
      "voltage": [230.1, 229.8, 230.5],
      "current": [15.2, 14.8, 15.1],
      "power": [3.5, 3.4, 3.5],
      "powerFactor": [0.95, 0.94, 0.96],
      "temperature": 42.5,
      "extraData": {
        "ambientTemperature": 25.3,
        "humidity": 45.2,
        "doorStatus": "closed",
        "maintenanceDue": false
      }
    }
  }'
```

### Getting Device Updates
```bash
curl http://localhost:3000/api/devices/CCMS-001/updates
```

### Acknowledging Updates
```bash
curl -X POST http://localhost:3000/api/devices/CCMS-001/updates \
  -H "Content-Type: application/json" \
  -d '{
    "acknowledgedSchedules": ["schedule-123"],
    "acknowledgedAlerts": ["alert-456"],
    "deviceStatus": "ONLINE"
  }'
```

## Data Types

### TelemetryData
```typescript
interface TelemetryData {
  timestamp: Date;
  voltage: number[];        // [V1, V2, V3]
  current: number[];        // [I1, I2, I3] 
  power: number[];          // [P1, P2, P3]
  powerFactor: number[];    // [PF1, PF2, PF3]
  temperature: number;
  extraData?: Record<string, any>; // Optional extra JSON data
}
```

### Device Status
- `ONLINE`: Device is operational and communicating
- `OFFLINE`: Device is not communicating
- `FAULT`: Device has detected a fault condition

### Schedule Modes
- `AUTO`: Automatic operation based on time/sensors
- `MANUAL`: Manual control mode
- `TWILIGHT`: Twilight sensor-based operation

### Alert Levels
- `INFO`: Informational message
- `WARNING`: Warning condition
- `CRITICAL`: Critical condition requiring immediate attention 