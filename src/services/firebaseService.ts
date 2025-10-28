/**
 * Firestore Service Layer
 * CRUD operations and collection helpers
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Unsubscribe,
  WriteBatch,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  UserProfile,
  LifeCV,
  Contact,
  CalendarEvent,
  Asset,
  TrustScore,
  Activity,
  Verification,
  Notification,
  Goal,
  HealthData,
  UserSettings,
} from '../types/models';

// ============= USER PROFILE OPERATIONS =============

export const firebaseService = {
  // ===== USER PROFILE =====
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  },

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async createUserProfile(userId: string, data: UserProfile): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  // ===== LIFE CV =====
  async getLifeCV(userId: string): Promise<LifeCV | null> {
    const docRef = doc(db, 'users', userId, 'profile', 'lifeCV');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as LifeCV) : null;
  },

  async updateLifeCV(userId: string, data: Partial<LifeCV>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'profile', 'lifeCV');
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // ===== CONTACTS =====
  async getContacts(userId: string): Promise<Contact[]> {
    const q = query(
      collection(db, 'users', userId, 'contacts'),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Contact);
  },

  async addContact(userId: string, contact: Contact): Promise<string> {
    const docRef = doc(collection(db, 'users', userId, 'contacts'));
    await setDoc(docRef, {
      ...contact,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateContact(userId: string, contactId: string, data: Partial<Contact>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'contacts', contactId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteContact(userId: string, contactId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'contacts', contactId);
    await deleteDoc(docRef);
  },

  // ===== CALENDAR EVENTS =====
  async getCalendarEvents(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const q = query(
      collection(db, 'users', userId, 'calendar'),
      where('startTime', '>=', Timestamp.fromDate(startDate)),
      where('startTime', '<=', Timestamp.fromDate(endDate)),
      orderBy('startTime', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as CalendarEvent);
  },

  async addCalendarEvent(userId: string, event: CalendarEvent): Promise<string> {
    const docRef = doc(collection(db, 'users', userId, 'calendar'));
    await setDoc(docRef, {
      ...event,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateCalendarEvent(userId: string, eventId: string, data: Partial<CalendarEvent>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'calendar', eventId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'calendar', eventId);
    await deleteDoc(docRef);
  },

  // ===== ASSETS =====
  async getAssets(userId: string): Promise<Asset[]> {
    const q = query(
      collection(db, 'users', userId, 'assets'),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Asset);
  },

  async addAsset(userId: string, asset: Asset): Promise<string> {
    const docRef = doc(collection(db, 'users', userId, 'assets'));
    await setDoc(docRef, {
      ...asset,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateAsset(userId: string, assetId: string, data: Partial<Asset>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'assets', assetId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // ===== TRUST SCORE =====
  async getTrustScore(userId: string): Promise<TrustScore | null> {
    const docRef = doc(db, 'users', userId, 'trust', 'score');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as TrustScore) : null;
  },

  async updateTrustScore(userId: string, data: Partial<TrustScore>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'trust', 'score');
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // ===== ACTIVITIES =====
  async getActivities(userId: string, limitCount: number = 20): Promise<Activity[]> {
    const q = query(
      collection(db, 'users', userId, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Activity);
  },

  async addActivity(userId: string, activity: Activity): Promise<string> {
    const docRef = doc(collection(db, 'users', userId, 'activities'));
    await setDoc(docRef, {
      ...activity,
      timestamp: Timestamp.now(),
    });
    return docRef.id;
  },

  // ===== VERIFICATIONS =====
  async getVerifications(userId: string): Promise<Verification[]> {
    const q = query(
      collection(db, 'users', userId, 'verifications'),
      orderBy('startedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Verification);
  },

  async getVerificationByType(userId: string, type: string): Promise<Verification | null> {
    const q = query(
      collection(db, 'users', userId, 'verifications'),
      where('type', '==', type)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : (querySnapshot.docs[0].data() as Verification);
  },

  async updateVerification(userId: string, verificationId: string, data: Partial<Verification>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'verifications', verificationId);
    await updateDoc(docRef, data);
  },

  // ===== NOTIFICATIONS =====
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let q;
    if (unreadOnly) {
      q = query(
        collection(db, 'users', userId, 'notifications'),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'users', userId, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Notification);
  },

  async addNotification(userId: string, notification: Notification): Promise<string> {
    const docRef = doc(collection(db, 'users', userId, 'notifications'));
    await setDoc(docRef, {
      ...notification,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(docRef, {
      read: true,
      readAt: Timestamp.now(),
    });
  },

  // ===== GOALS =====
  async getGoals(userId: string, status?: string): Promise<Goal[]> {
    let q;
    if (status) {
      q = query(
        collection(db, 'users', userId, 'goals'),
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'users', userId, 'goals'),
        orderBy('updatedAt', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Goal);
  },

  async addGoal(userId: string, goal: Goal): Promise<string> {
    const docRef = doc(collection(db, 'users', userId, 'goals'));
    await setDoc(docRef, {
      ...goal,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateGoal(userId: string, goalId: string, data: Partial<Goal>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'goals', goalId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // ===== HEALTH =====
  async getHealthData(userId: string): Promise<HealthData | null> {
    const docRef = doc(db, 'users', userId, 'health', 'data');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as HealthData) : null;
  },

  async updateHealthData(userId: string, data: Partial<HealthData>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'health', 'data');
    await updateDoc(docRef, {
      ...data,
      lastUpdated: Timestamp.now(),
    });
  },

  // ===== SETTINGS =====
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserSettings) : null;
  },

  async updateUserSettings(userId: string, data: Partial<UserSettings>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // ===== REAL-TIME LISTENERS =====
  onUserProfileChange(userId: string, callback: (profile: UserProfile | null) => void): Unsubscribe {
    const docRef = doc(db, 'users', userId);
    return onSnapshot(docRef, (docSnap) => {
      callback(docSnap.exists() ? (docSnap.data() as UserProfile) : null);
    });
  },

  onActivitiesChange(userId: string, callback: (activities: Activity[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'users', userId, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map((doc) => doc.data() as Activity);
      callback(activities);
    });
  },

  onNotificationsChange(userId: string, callback: (notifications: Notification[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map((doc) => doc.data() as Notification);
      callback(notifications);
    });
  },

  // ===== BATCH OPERATIONS =====
  async batchUpdateMultipleContacts(userId: string, updates: Array<{ id: string; data: Partial<Contact> }>): Promise<void> {
    const batch = writeBatch(db);
    updates.forEach(({ id, data }) => {
      const docRef = doc(db, 'users', userId, 'contacts', id);
      batch.update(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    });
    await batch.commit();
  },

  async batchDeleteContacts(userId: string, contactIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    contactIds.forEach((id) => {
      const docRef = doc(db, 'users', userId, 'contacts', id);
      batch.delete(docRef);
    });
    await batch.commit();
  },
};
