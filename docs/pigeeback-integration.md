# Pigeeback - Community Hub Integration Implementation Guide

---

**Document Version:** 1.2  
**Last Updated:** September 16, 2025  
**LifeSync Version:** 1.0.0  

---

## Overview
Pigeeback integrates transportation safety monitoring and ride-sharing verification into LifeSync Community Hub, providing real-time transportation safety for community members. This integration supports the latest LifeSync features including household types (freestanding, flat single building, flat complex, cluster/townhouse, farm/smallholding, compound, other), scopes (my dwelling, entire property, etc.), GPS-paired addresses, and invite-based member management.

## Core Integration Requirements

### 1. Trip Safety Monitoring Service

#### API Endpoint Implementation
```javascript
// GET /api/pigeeback/trip/safety/:tripId
app.get('/api/pigeeback/trip/safety/:tripId', async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findOne({
      where: { id: tripId },
      include: [
        { model: User, as: 'driver' },
        { model: User, as: 'passengers' },
        { model: SafetyCheck, as: 'safetyChecks' }
      ]
    });

    if (!trip) {
      return res.status(404).json({
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' }
      });
    }

    const safetyScore = await calculateTripSafetyScore(trip);
    const route = await getOptimizedRoute(trip.startLocation, trip.endLocation);

    res.json({
      tripId: trip.id,
      safetyScore,
      route: {
        start: trip.startLocation,
        end: trip.endLocation,
        waypoints: route.waypoints || []
      },
      participants: [
        {
          userId: trip.driver.id,
          role: 'driver',
          verified: await verifyDriverCredentials(trip.driver),
          emergencyContact: trip.driver.emergencyContact,
          household: trip.driver.household ? {
            id: trip.driver.household.id,
            householdType: trip.driver.household.householdType || 'freestanding', // New: household type
            scope: trip.driver.household.scope || 'my_dwelling', // New: scope
            coordinates: trip.driver.household.coordinates, // New: GPS coordinates
            inviteLinks: trip.driver.household.members?.map(member => ({ // New: invite links
              memberId: member.id,
              link: `${process.env.LIFESYNC_BASE_URL}/join/${member.id.toString(36)}-${member.name.replace(/\s+/g, '-').toLowerCase()}`
            })) || []
          } : null
        },
        ...trip.passengers.map(passenger => ({
          userId: passenger.id,
          role: 'passenger',
          verified: await verifyPassengerCredentials(passenger),
          emergencyContact: passenger.emergencyContact,
          household: passenger.household ? {
            id: passenger.household.id,
            householdType: passenger.household.householdType || 'freestanding', // New: household type
            scope: passenger.household.scope || 'my_dwelling', // New: scope
            coordinates: passenger.household.coordinates, // New: GPS coordinates
            inviteLinks: passenger.household.members?.map(member => ({ // New: invite links
              memberId: member.id,
              link: `${process.env.LIFESYNC_BASE_URL}/join/${member.id.toString(36)}-${member.name.replace(/\s+/g, '-').toLowerCase()}`
            })) || []
          } : null
        }))
      ],
      safetyFeatures: {
        realTimeTracking: trip.realTimeTracking,
        emergencyButton: trip.emergencyButton,
        routeSharing: trip.routeSharing,
        sosEnabled: trip.sosEnabled
      }
    });
  } catch (error) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Trip safety lookup failed' }
    });
  }
});
```

#### Database Schema
```sql
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  coordinates JSONB, -- New: GPS coordinates {lat, lng}
  no_formal_address BOOLEAN DEFAULT false, -- New: for rural areas
  household_type VARCHAR(50) DEFAULT 'freestanding', -- New: freestanding, flat_single, flat_complex, cluster, farm, compound, other
  scope VARCHAR(50) DEFAULT 'my_dwelling', -- New: my_dwelling, entire_property, etc.
  description TEXT,
  dwellings INTEGER DEFAULT 1,
  families INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id),
  start_location JSONB NOT NULL,
  end_location JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'planned',
  real_time_tracking BOOLEAN DEFAULT true,
  emergency_button BOOLEAN DEFAULT true,
  route_sharing BOOLEAN DEFAULT true,
  sos_enabled BOOLEAN DEFAULT true,
  community_id UUID REFERENCES communities(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id),
  passenger_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'invited',
  joined_at TIMESTAMP,
  left_at TIMESTAMP
);

CREATE TABLE safety_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id),
  check_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  result JSONB,
  checked_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Transportation Alert Service

#### API Endpoint Implementation
```javascript
// POST /api/pigeeback/alert/transportation
app.post('/api/pigeeback/alert/transportation', async (req, res) => {
  const { communityId, alertType, tripId, location, description, severity } = req.body;

  try {
    // Validate community access
    const community = await Community.findOne({
      where: { id: communityId },
      include: [{ model: User, as: 'members' }]
    });

    if (!community) {
      return res.status(404).json({
        error: { code: 'COMMUNITY_NOT_FOUND', message: 'Community not found' }
      });
    }

    // Create transportation alert
    const alert = await TransportationAlert.create({
      communityId,
      alertType,
      tripId,
      location,
      description,
      severity,
      status: 'active'
    });

    // Notify community members via multiple channels
    await notifyCommunityTransportAlert(community, alert);

    // If high severity, trigger emergency protocols
    if (severity === 'high') {
      await triggerEmergencyResponse(community, alert);
    }

    res.status(201).json({
      alertId: alert.id,
      status: 'created',
      notificationsSent: community.members.length
    });
  } catch (error) {
    res.status(500).json({
      error: { code: 'ALERT_CREATION_FAILED', message: 'Failed to create transportation alert' }
    });
  }
});
```

### 3. Real-time Location Tracking

#### WebSocket Implementation
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const message = JSON.parse(data);

    if (message.type === 'location_update') {
      const { tripId, userId, location, timestamp } = message;

      // Update trip location in real-time
      await updateTripLocation(tripId, userId, location, timestamp);

      // Check for safety concerns
      const safetyConcerns = await analyzeLocationSafety(tripId, location);

      if (safetyConcerns.length > 0) {
        // Send alerts to trip participants
        await sendTripSafetyAlerts(tripId, safetyConcerns);

        // Notify community if severe
        if (safetyConcerns.some(c => c.severity === 'high')) {
          await notifyCommunitySafetyConcern(tripId, safetyConcerns);
        }
      }

      // Broadcast location to authorized subscribers
      ws.send(JSON.stringify({
        type: 'location_updated',
        tripId,
        userId,
        location,
        timestamp
      }));
    }
  });
});
```

### 4. Safety Score Calculation

#### Algorithm Implementation
```javascript
async function calculateTripSafetyScore(trip) {
  let score = 50; // Base score

  // Driver verification (+20)
  if (await verifyDriverCredentials(trip.driver)) score += 20;

  // Vehicle safety check (+15)
  if (trip.vehicleSafetyCheck) score += 15;

  // Passenger verification (+10)
  const verifiedPassengers = trip.passengers.filter(p => verifyPassengerCredentials(p)).length;
  score += (verifiedPassengers / trip.passengers.length) * 10;

  // Route safety (+10)
  const routeSafety = await analyzeRouteSafety(trip.route);
  score += routeSafety.score;

  // Time of day adjustment (-10 for night)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) score -= 10;

  // Weather conditions (-5 for bad weather)
  const weather = await getWeatherConditions(trip.startLocation);
  if (weather.risk > 0.7) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}
```

### 5. Emergency Response System

#### Emergency Protocol Implementation
```javascript
async function triggerEmergencyResponse(community, alert) {
  // Step 1: Notify emergency contacts
  const emergencyContacts = await getEmergencyContacts(community.id);
  await sendEmergencyNotifications(emergencyContacts, alert);

  // Step 2: Alert nearby community members
  const nearbyMembers = await findNearbyMembers(alert.location, 1000); // 1km radius
  await sendProximityAlerts(nearbyMembers, alert);

  // Step 3: Contact emergency services if critical
  if (alert.severity === 'critical') {
    await contactEmergencyServices(alert);
  }

  // Step 4: Create emergency response team
  const responseTeam = await assembleResponseTeam(community.id, alert.location);
  await coordinateResponseTeam(responseTeam, alert);

  // Step 5: Log emergency response
  await logEmergencyResponse(alert.id, {
    contacts: emergencyContacts.length,
    nearbyMembers: nearbyMembers.length,
    emergencyServices: alert.severity === 'critical',
    responseTeam: responseTeam.length
  });
}
```

### 6. UI Components Integration

#### React Components
```jsx
// TransportationSafetyMonitor.jsx
import { useEffect, useState } from 'react';

export default function TransportationSafetyMonitor({ communityId }) {
  const [activeTrips, setActiveTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Connect to real-time updates
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trip_update') {
        updateTripData(data);
      }
    };

    return () => ws.close();
  }, [communityId]);

  return (
    <div className="transportation-monitor">
      <h3>Community Transportation Safety</h3>
      <div className="active-trips">
        {activeTrips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
      <div className="safety-alerts">
        {alerts.map(alert => (
          <SafetyAlert key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
```

### 7. Testing Suite

#### Integration Tests
```javascript
describe('Transportation Safety API', () => {
  test('should return trip safety data', async () => {
    const tripId = 'trip-123';
    const response = await request(app)
      .get(`/api/pigeeback/trip/safety/${tripId}`)
      .expect(200);

    expect(response.body).toHaveProperty('tripId');
    expect(response.body).toHaveProperty('safetyScore');
    expect(response.body).toHaveProperty('participants');
    expect(response.body).toHaveProperty('safetyFeatures');
  });

  test('should create transportation alert', async () => {
    const alertData = {
      communityId: 'community-123',
      alertType: 'transportation_emergency',
      location: { lat: -26.2041, lng: 28.0473 },
      description: 'Vehicle breakdown',
      severity: 'high'
    };

    const response = await request(app)
      .post('/api/pigeeback/alert/transportation')
      .send(alertData)
      .expect(201);

    expect(response.body).toHaveProperty('alertId');
    expect(response.body).toHaveProperty('notificationsSent');
  });
});
```

### 8. Deployment Configuration

#### Environment Variables
```bash
# Pigeeback Service Configuration
PIGEEBACK_DB_HOST=localhost
PIGEEBACK_DB_PORT=5432
PIGEEBACK_JWT_SECRET=your-secret-key
PIGEEBACK_WEBHOOK_SECRET=webhook-secret
COMMUNITY_HUB_URL=https://hub.salatiso.com
EMERGENCY_SERVICES_API_KEY=emergency-api-key
WEATHER_API_KEY=weather-api-key
```

#### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000 8080
CMD ["npm", "start"]
```

This implementation guide provides the complete technical specification for Pigeeback's integration with the Community Hub, enabling real-time transportation safety monitoring within community networks.