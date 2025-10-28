# Family Value - Community Hub Integration Implementation Guide

---

**Document Version:** 1.2  
**Last Updated:** September 16, 2025  
**LifeSync Version:** 1.0.0  

---

## Overview
Family Value integrates family verification and trust quantification into LifeSync Community Hub, enabling verified family networks within community safety systems. This integration supports the latest LifeSync features including household types (freestanding, flat single building, flat complex, cluster/townhouse, farm/smallholding, compound, other), scopes (my dwelling, entire property, etc.), GPS-paired addresses, and invite-based member management.

## Core Integration Requirements

### 1. Family Verification Service

#### API Endpoint Implementation
```javascript
// GET /api/family-value/verification/:userId
app.get('/api/family-value/verification/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const verification = await FamilyVerification.findOne({
      where: { userId },
      include: [{
        model: FamilyRelationship,
        as: 'relationships',
        where: { verified: true }
      }]
    });

    if (!verification) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'User verification not found' }
      });
    }

    res.json({
      userId: verification.userId,
      verified: verification.verified,
      trustScore: verification.trustScore,
      relationships: verification.relationships.map(rel => ({
        relativeId: rel.relativeId,
        relationship: rel.relationship,
        verified: rel.verified,
        trustLevel: rel.trustLevel
      })),
      lastVerified: verification.updatedAt
    });
  } catch (error) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Verification lookup failed' }
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

CREATE TABLE family_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  verified BOOLEAN DEFAULT false,
  trust_score INTEGER CHECK (trust_score >= 0 AND trust_score <= 100),
  verification_documents JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  relative_id UUID NOT NULL REFERENCES users(id),
  relationship VARCHAR(50) NOT NULL,
  verified BOOLEAN DEFAULT false,
  trust_level VARCHAR(20) DEFAULT 'unknown',
  verification_proof JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Household Validation Service

#### API Endpoint Implementation
```javascript
// POST /api/family-value/household/validate
app.post('/api/family-value/household/validate', async (req, res) => {
  const { householdId, members, communityId } = req.body;

  try {
    // Validate household exists in community
    const household = await Household.findOne({
      where: { id: householdId, communityId }
    });

    if (!household) {
      return res.status(404).json({
        error: { code: 'HOUSEHOLD_NOT_FOUND', message: 'Household not found in community' }
      });
    }

    // Check family relationships between members
    const validations = [];
    let totalTrustScore = 0;

    for (const memberId of members) {
      const verification = await FamilyVerification.findOne({
        where: { userId: memberId },
        include: [{
          model: FamilyRelationship,
          as: 'relationships',
          where: { relativeId: { [Op.in]: members } }
        }]
      });

      if (verification) {
        totalTrustScore += verification.trustScore;
        validations.push({
          userId: memberId,
          verified: verification.verified,
          trustScore: verification.trustScore,
          familyConnections: verification.relationships.length
        });
      }
    }

    const averageTrustScore = members.length > 0 ? totalTrustScore / members.length : 0;
    const warnings = [];

    if (averageTrustScore < 70) {
      warnings.push('Low average trust score - additional verification recommended');
    }

    if (validations.filter(v => !v.verified).length > 0) {
      warnings.push('Some members have unverified family relationships');
    }

    res.json({
      valid: warnings.length === 0,
      warnings,
      trustScore: Math.round(averageTrustScore),
      validations,
      household: {
        id: household.id,
        name: household.name,
        householdType: household.householdType || 'freestanding', // New: household type
        scope: household.scope || 'my_dwelling', // New: scope
        coordinates: household.coordinates, // New: GPS coordinates
        inviteLinks: household.members?.map(member => ({ // New: invite links
          memberId: member.id,
          link: `${process.env.LIFESYNC_BASE_URL}/join/${member.id.toString(36)}-${member.name.replace(/\s+/g, '-').toLowerCase()}`
        })) || []
      },
      recommendations: generateRecommendations(validations, warnings)
    });
  } catch (error) {
    res.status(500).json({
      error: { code: 'VALIDATION_ERROR', message: 'Household validation failed' }
    });
  }
});
```

### 3. Trust Score Calculation

#### Algorithm Implementation
```javascript
function calculateTrustScore(verification) {
  let score = 50; // Base score

  // Verification status (+30)
  if (verification.verified) score += 30;

  // Document completeness (+20)
  const requiredDocs = ['id', 'birth_certificate', 'family_tree'];
  const providedDocs = Object.keys(verification.documents || {});
  const completeness = providedDocs.filter(doc => requiredDocs.includes(doc)).length / requiredDocs.length;
  score += completeness * 20;

  // Relationship network (+20)
  const relationshipCount = verification.relationships?.length || 0;
  score += Math.min(relationshipCount * 5, 20);

  // Time since last verification (-10 over time)
  const daysSinceVerification = (Date.now() - new Date(verification.lastVerified)) / (1000 * 60 * 60 * 24);
  const timePenalty = Math.min(daysSinceVerification / 365 * 10, 10);
  score -= timePenalty;

  return Math.max(0, Math.min(100, Math.round(score)));
}
```

### 4. Webhook Integration

#### Community Hub Event Handling
```javascript
// Handle household creation events
app.post('/webhooks/community/household-created', async (req, res) => {
  const { householdId, members, communityId } = req.body;

  try {
    // Trigger family validation
    const validation = await validateHouseholdFamily({ householdId, members, communityId });

    // Update household with trust score
    await Household.update(
      { familyTrustScore: validation.trustScore },
      { where: { id: householdId } }
    );

    // Notify community if validation issues found
    if (!validation.valid) {
      await sendCommunityNotification(communityId, {
        type: 'family_validation_warning',
        householdId,
        warnings: validation.warnings
      });
    }

    res.json({ status: 'processed' });
  } catch (error) {
    console.error('Household validation webhook failed:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
```

### 5. UI Components Integration

#### React Components
```jsx
// FamilyTrustIndicator.jsx
import { useEffect, useState } from 'react';

export default function FamilyTrustIndicator({ userId }) {
  const [trustData, setTrustData] = useState(null);

  useEffect(() => {
    fetch(`/api/family-value/verification/${userId}`)
      .then(res => res.json())
      .then(setTrustData)
      .catch(console.error);
  }, [userId]);

  if (!trustData) return <div>Loading...</div>;

  return (
    <div className="family-trust-indicator">
      <div className="trust-score">
        Trust Score: {trustData.trustScore}/100
      </div>
      <div className="verification-status">
        {trustData.verified ? '✓ Verified' : '⚠ Unverified'}
      </div>
      <div className="relationships">
        Family Connections: {trustData.relationships.length}
      </div>
    </div>
  );
}
```

### 6. Testing Suite

#### Unit Tests
```javascript
describe('Family Verification API', () => {
  test('should return verification data for valid user', async () => {
    const response = await request(app)
      .get('/api/family-value/verification/user-123')
      .expect(200);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('trustScore');
    expect(response.body).toHaveProperty('relationships');
  });

  test('should return 404 for non-existent user', async () => {
    await request(app)
      .get('/api/family-value/verification/invalid-user')
      .expect(404);
  });
});
```

### 7. Deployment Configuration

#### Environment Variables
```bash
# Family Value Service Configuration
FAMILY_VALUE_DB_HOST=localhost
FAMILY_VALUE_DB_PORT=5432
FAMILY_VALUE_JWT_SECRET=your-secret-key
FAMILY_VALUE_WEBHOOK_SECRET=webhook-secret
COMMUNITY_HUB_URL=https://hub.salatiso.com
```

#### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

This implementation guide provides the complete technical specification for Family Value's integration with the Community Hub, ensuring verified family networks within community safety systems.