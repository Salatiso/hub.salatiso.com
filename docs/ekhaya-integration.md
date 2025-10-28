# Ekhaya - Community Hub Integration Implementation Guide

---

**Document Version:** 1.2  
**Last Updated:** September 16, 2025  
**LifeSync Version:** 1.0.0  

---

## Overview
Ekhaya integrates property management and home security into LifeSync Community Hub, enabling coordinated neighborhood watch and property security monitoring. This integration supports the latest LifeSync features including household types (freestanding, flat single building, flat complex, cluster/townhouse, farm/smallholding, compound, other), scopes (my dwelling, entire property, etc.), GPS-paired addresses, and invite-based member management.

## Core Integration Requirements

### 1. Property Security Service

#### API Endpoint Implementation
```javascript
// GET /api/ekhaya/property/security/:propertyId
app.get('/api/ekhaya/property/security/:propertyId', async (req, res) => {
  const { propertyId } = req.params;

  try {
    const property = await Property.findOne({
      where: { id: propertyId },
      include: [
        { model: SecurityDevice, as: 'devices' },
        { model: SecurityAlert, as: 'alerts' },
        { model: Household, as: 'household' }
      ]
    });

    if (!property) {
      return res.status(404).json({
        error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' }
      });
    }

    const securityStatus = await calculateSecurityStatus(property);
    const neighborhood = await getNeighborhoodStats(property.location);

    res.json({
      propertyId: property.id,
      householdId: property.householdId,
      householdType: property.household?.householdType || 'freestanding', // New: household type
      scope: property.household?.scope || 'my_dwelling', // New: scope
      coordinates: property.household?.coordinates, // New: GPS coordinates
      securityStatus,
      devices: property.devices.map(device => ({
        id: device.id,
        type: device.type,
        status: device.status,
        lastActivity: device.lastActivity
      })),
      alerts: property.alerts
        .filter(alert => alert.timestamp > Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        .map(alert => ({
          type: alert.type,
          severity: alert.severity,
          timestamp: alert.timestamp
        })),
      neighborhood: {
        crimeRate: neighborhood.crimeRate,
        watchActive: neighborhood.watchActive,
        communityCoverage: neighborhood.communityCoverage
      },
      inviteLinks: property.household?.members?.map(member => ({ // New: invite links
        memberId: member.id,
        link: `${process.env.LIFESYNC_BASE_URL}/join/${member.id.toString(36)}-${member.name.replace(/\s+/g, '-').toLowerCase()}`
      })) || []
    });
  } catch (error) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Property security lookup failed' }
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

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id),
  address JSONB NOT NULL,
  property_type VARCHAR(50) DEFAULT 'residential',
  security_system VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE security_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  device_type VARCHAR(50) NOT NULL,
  device_id VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'offline',
  last_activity TIMESTAMP,
  configuration JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  description TEXT,
  location JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE neighborhood_watch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id),
  active BOOLEAN DEFAULT false,
  coverage_area GEOMETRY(POLYGON),
  participants UUID[] DEFAULT '{}',
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Neighborhood Watch Coordination Service

#### API Endpoint Implementation
```javascript
// POST /api/ekhaya/neighborhood/watch
app.post('/api/ekhaya/neighborhood/watch', async (req, res) => {
  const { communityId, action, location, description, participants } = req.body;

  try {
    let watch = await NeighborhoodWatch.findOne({
      where: { communityId }
    });

    if (!watch) {
      watch = await NeighborhoodWatch.create({
        communityId,
        active: false,
        coverageArea: calculateCoverageArea(location),
        participants: []
      });
    }

    switch (action) {
      case 'activate':
        await watch.update({
          active: true,
          lastActivity: new Date()
        });
        await notifyWatchActivation(communityId, participants);
        break;

      case 'deactivate':
        await watch.update({
          active: false,
          lastActivity: new Date()
        });
        break;

      case 'report':
        await createWatchReport(communityId, location, description, participants);
        await notifyWatchParticipants(communityId, {
          type: 'incident_report',
          location,
          description,
          reportedBy: req.user.id
        });
        break;

      default:
        return res.status(400).json({
          error: { code: 'INVALID_ACTION', message: 'Invalid watch action' }
        });
    }

    res.json({
      watchId: watch.id,
      action,
      status: watch.active ? 'active' : 'inactive',
      participants: watch.participants.length
    });
  } catch (error) {
    res.status(500).json({
      error: { code: 'WATCH_OPERATION_FAILED', message: 'Neighborhood watch operation failed' }
    });
  }
});
```

### 3. Security Alert Processing

#### Real-time Alert Handling
```javascript
// WebSocket-based real-time security alerts
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const message = JSON.parse(data);

    if (message.type === 'security_alert') {
      const { propertyId, alertType, severity, description, location } = message;

      // Create security alert
      const alert = await SecurityAlert.create({
        propertyId,
        alertType,
        severity,
        description,
        location,
        resolved: false
      });

      // Determine alert priority and response
      const response = await determineAlertResponse(alert);

      // Notify property owner immediately
      await sendImmediateNotification(propertyId, alert);

      // Notify community if high severity
      if (severity === 'high' || severity === 'critical') {
        await notifyCommunitySecurityAlert(propertyId, alert);
      }

      // Trigger automated responses
      if (response.automatedActions) {
        await executeAutomatedResponses(alert, response.automatedActions);
      }

      // Send confirmation to device
      ws.send(JSON.stringify({
        type: 'alert_processed',
        alertId: alert.id,
        response: response.type
      }));
    }
  });
});
```

### 4. Security Status Calculation

#### Algorithm Implementation
```javascript
async function calculateSecurityStatus(property) {
  let status = 'unknown';
  let score = 0;

  // Device connectivity (+40)
  const onlineDevices = property.devices.filter(d => d.status === 'online').length;
  const deviceConnectivity = onlineDevices / property.devices.length;
  score += deviceConnectivity * 40;

  // Recent activity (+20)
  const recentActivity = property.devices.filter(d =>
    d.lastActivity && (Date.now() - new Date(d.lastActivity)) < 60 * 60 * 1000 // 1 hour
  ).length > 0;
  if (recentActivity) score += 20;

  // Alert history (-30)
  const recentAlerts = property.alerts.filter(a =>
    a.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days
  ).length;
  score -= Math.min(recentAlerts * 5, 30);

  // Neighborhood watch (+20)
  const neighborhoodWatch = await checkNeighborhoodWatch(property.location);
  if (neighborhoodWatch.active) score += 20;

  // Determine status based on score
  if (score >= 80) status = 'secure';
  else if (score >= 60) status = 'monitoring';
  else if (score >= 40) status = 'attention_needed';
  else if (score >= 20) status = 'vulnerable';
  else status = 'breach';

  return status;
}
```

### 5. Automated Response System

#### Response Engine Implementation
```javascript
async function determineAlertResponse(alert) {
  const responses = {
    intrusion: {
      high: ['notify_owner', 'notify_neighbors', 'activate_sirens', 'contact_police'],
      medium: ['notify_owner', 'notify_neighbors', 'log_incident'],
      low: ['notify_owner', 'log_incident']
    },
    fire: {
      high: ['notify_owner', 'activate_sprinklers', 'contact_fire_department', 'evacuate_area'],
      medium: ['notify_owner', 'contact_fire_department'],
      low: ['notify_owner', 'log_incident']
    },
    flood: {
      high: ['notify_owner', 'activate_pumps', 'contact_emergency_services'],
      medium: ['notify_owner', 'monitor_water_levels'],
      low: ['notify_owner', 'log_incident']
    }
  };

  const alertResponses = responses[alert.alertType] || {};
  const severityResponses = alertResponses[alert.severity] || ['notify_owner', 'log_incident'];

  return {
    type: severityResponses.includes('contact_police') || severityResponses.includes('contact_fire_department')
      ? 'emergency' : 'standard',
    automatedActions: severityResponses,
    manualActions: ['verify_incident', 'update_status']
  };
}

async function executeAutomatedResponses(alert, actions) {
  for (const action of actions) {
    switch (action) {
      case 'notify_owner':
        await sendOwnerNotification(alert.propertyId, alert);
        break;
      case 'notify_neighbors':
        await notifyNearbyNeighbors(alert.propertyId, alert);
        break;
      case 'activate_sirens':
        await activateSecuritySirens(alert.propertyId);
        break;
      case 'contact_police':
        await contactPoliceService(alert);
        break;
      case 'contact_fire_department':
        await contactFireDepartment(alert);
        break;
      case 'activate_sprinklers':
        await activateFireSprinklers(alert.propertyId);
        break;
      case 'evacuate_area':
        await initiateAreaEvacuation(alert.location);
        break;
    }
  }
}
```

### 6. UI Components Integration

#### React Components
```jsx
// PropertySecurityDashboard.jsx
import { useEffect, useState } from 'react';

export default function PropertySecurityDashboard({ householdId }) {
  const [properties, setProperties] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch(`/api/ekhaya/household/${householdId}/properties`)
      .then(res => res.json())
      .then(setProperties)
      .catch(console.error);
  }, [householdId]);

  return (
    <div className="property-security-dashboard">
      <h3>Property Security Overview</h3>
      <div className="properties-grid">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      <div className="recent-alerts">
        <h4>Recent Security Alerts</h4>
        {alerts.map(alert => (
          <SecurityAlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
```

### 7. Testing Suite

#### Integration Tests
```javascript
describe('Property Security API', () => {
  test('should return property security status', async () => {
    const propertyId = 'property-123';
    const response = await request(app)
      .get(`/api/ekhaya/property/security/${propertyId}`)
      .expect(200);

    expect(response.body).toHaveProperty('propertyId');
    expect(response.body).toHaveProperty('securityStatus');
    expect(response.body).toHaveProperty('devices');
    expect(response.body).toHaveProperty('neighborhood');
  });

  test('should handle neighborhood watch activation', async () => {
    const watchData = {
      communityId: 'community-123',
      action: 'activate',
      location: { lat: -26.2041, lng: 28.0473 },
      participants: ['user-1', 'user-2']
    };

    const response = await request(app)
      .post('/api/ekhaya/neighborhood/watch')
      .send(watchData)
      .expect(200);

    expect(response.body).toHaveProperty('watchId');
    expect(response.body.action).toBe('activate');
  });
});
```

### 8. Deployment Configuration

#### Environment Variables
```bash
# Ekhaya Service Configuration
EKHAYA_DB_HOST=localhost
EKHAYA_DB_PORT=5432
EKHAYA_JWT_SECRET=your-secret-key
EKHAYA_WEBHOOK_SECRET=webhook-secret
COMMUNITY_HUB_URL=https://hub.salatiso.com
POLICE_API_ENDPOINT=https://police-api.southafrica.gov.za
FIRE_DEPARTMENT_API_ENDPOINT=https://fire-api.southafrica.gov.za
```

#### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000 8081
CMD ["npm", "start"]
```

This implementation guide provides the complete technical specification for Ekhaya's integration with the Community Hub, enabling comprehensive property security and neighborhood watch coordination within community safety networks.