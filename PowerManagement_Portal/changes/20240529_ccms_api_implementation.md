# CCMS API Implementation

This change implements the following APIs and real-time dashboard functionality for the CCMS system:

## API Endpoints

### Device Management
- `POST /api/devices`
  - Add new CCMS device to the system
  - Required fields: deviceId, powerRating, voltage, frequency, incomingCurrent, ipRating, location

### Telemetry
- `POST /api/telemetry/:deviceId`
  - Report device telemetry data
  - Fields: voltage[], current[], power[], powerFactor[], temperature

### Alerts
- `POST /api/alerts`
  - Report device alerts
  - Fields: deviceId, message, level (INFO/WARNING/CRITICAL)

### Schedules
- `GET /api/schedules/:deviceId`
  - Get device schedules
  - Returns array of schedules with startTime, endTime, and mode

### Dashboard
- `GET /api/dashboard/stats`
  - Real-time dashboard statistics
  - Updates every 5 seconds
  - Returns: device status counts, latest alerts, power consumption metrics

## Implementation Details

- Real-time updates using Server-Sent Events (SSE)
- MongoDB with Prisma ORM for data persistence
- Proper error handling and validation
- Rate limiting for API endpoints
- Authentication and authorization checks