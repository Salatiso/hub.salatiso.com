/**
 * Data Models & TypeScript Interfaces
 * Defines all data structures for Firestore collections
 */

// ============= USER PROFILE =============

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  trustScore: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'trusted';
}

// ============= LIFE CV =============

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate: Date;
}

export interface LifeCV {
  id: string;
  userId: string;
  headline?: string;
  summary?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications?: string[];
  languages: string[];
  updatedAt: Date;
}

// ============= CONTACTS =============

export interface Contact {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  address?: string;
  photoURL?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= CALENDAR =============

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: 'meeting' | 'event' | 'reminder' | 'task';
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= ASSETS =============

export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: 'property' | 'vehicle' | 'investment' | 'digital' | 'other';
  value?: number;
  description?: string;
  documents?: string[]; // URLs to asset documents
  createdAt: Date;
  updatedAt: Date;
}

// ============= TRUST SCORE =============

export interface TrustMetric {
  category: string;
  score: number;
  verified: boolean;
}

export interface TrustScore {
  id: string;
  userId: string;
  overallScore: number;
  metrics: TrustMetric[];
  verifiedCount: number;
  updatedAt: Date;
}

// ============= ACTIVITY =============

export interface Activity {
  id: string;
  userId: string;
  type: 'login' | 'update' | 'verification' | 'contact_added' | 'asset_added' | 'event_created' | 'goal_updated';
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============= VERIFICATION =============

export interface VerificationStep {
  step: number;
  name: string;
  completed: boolean;
  completedAt?: Date;
}

export interface Verification {
  id: string;
  userId: string;
  type: 'email' | 'phone' | 'identity' | 'address' | 'background_check';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  steps: VerificationStep[];
  progress: number;
  startedAt: Date;
  completedAt?: Date;
}

// ============= NOTIFICATIONS =============

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

// ============= GOALS =============

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'personal' | 'professional' | 'financial' | 'health' | 'education' | 'other';
  targetDate?: Date;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

// ============= HEALTH =============

export interface HealthMetric {
  id: string;
  userId: string;
  type: 'blood_pressure' | 'heart_rate' | 'weight' | 'steps' | 'sleep' | 'mood' | 'custom';
  value: number;
  unit: string;
  recordedAt: Date;
}

export interface HealthData {
  id: string;
  userId: string;
  metrics: HealthMetric[];
  notes?: string;
  lastUpdated: Date;
}

// ============= SETTINGS =============

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'private' | 'friends' | 'public';
    showEmail: boolean;
    showPhone: boolean;
  };
  updatedAt: Date;
}

// ============= SEARCH RESULT =============

export interface SearchResult {
  id: string;
  type: 'contact' | 'asset' | 'event' | 'goal' | 'activity';
  title: string;
  subtitle?: string;
  icon: string;
  url: string;
}
