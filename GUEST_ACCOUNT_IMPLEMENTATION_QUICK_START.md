# 🚀 GUEST ACCOUNT SYSTEM - Quick Implementation Guide

**Quick Setup**: 15 minutes to get guest accounts running!

---

## Step 1: Add Routes to App.tsx (2 minutes)

Add these routes to your `src/App.tsx`:

```typescript
import GuestLogin from '@/pages/GuestLogin';
import { guestAccountService } from '@/services/guestAccountService';

// In your routes configuration:
<Route path="/guest-login" element={
  <GuestLogin 
    onGuestCreated={(name) => {
      console.log(`Guest account created for ${name}`);
      navigate('/dashboard');
    }}
    onSignInClick={() => navigate('/login')}
    onSignUpClick={() => navigate('/auth/signup')}
  />
} />
```

---

## Step 2: Update Public Landing (2 minutes)

In `src/pages/Home.tsx` or `PublicLanding.tsx`, add:

```typescript
import { useNavigate } from 'react-router-dom';

export const PublicLanding = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Existing content */}
      
      {/* Add CTA for guest account */}
      <button 
        onClick={() => navigate('/guest-login')}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
      >
        👤 Try Free - No Signup
      </button>
    </div>
  );
};
```

---

## Step 3: Add Guest Status to Dashboard (3 minutes)

In `src/pages/Dashboard.tsx`:

```typescript
import { GuestStatusBadge } from '@/components/GuestAuthStatus';
import { GuestUpgradePrompt } from '@/components/GuestBenefitsPromo';
import { guestAccountService } from '@/services/guestAccountService';

export const Dashboard = () => {
  const isGuest = guestAccountService.isGuestUser();

  return (
    <div>
      {/* Header with guest status */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {isGuest && <GuestStatusBadge compact={true} />}
      </div>

      {/* Your existing dashboard content */}

      {/* Guest upgrade prompt */}
      {isGuest && (
        <div className="mb-6">
          <GuestUpgradePrompt 
            onUpgrade={() => navigate('/auth/signup')}
            variant="card"
          />
        </div>
      )}
    </div>
  );
};
```

---

## Step 4: Update Header/Navigation (2 minutes)

In `src/components/Header.tsx`:

```typescript
import { GuestStatusBadge } from '@/components/GuestAuthStatus';
import { guestAccountService } from '@/services/guestAccountService';

export const Header = () => {
  const isGuest = guestAccountService.isGuestUser();

  return (
    <header className="flex justify-between items-center p-4">
      <div className="logo">LifeSync</div>
      
      <nav className="flex items-center gap-4">
        {isGuest && <GuestStatusBadge compact={true} />}
        
        {/* Your other nav items */}
      </nav>
    </header>
  );
};
```

---

## Step 5: Handle Guest Logout (2 minutes)

In your auth/logout handler:

```typescript
import { guestAccountService } from '@/services/guestAccountService';

export const handleLogout = () => {
  const isGuest = guestAccountService.isGuestUser();

  if (isGuest) {
    // Optional: Show option to keep or clear guest data
    if (confirm('Keep your guest account data?')) {
      // Keep data, just clear auth state
      logoutAuthService();
    } else {
      // Clear everything
      guestAccountService.clearGuestAccount();
      logoutAuthService();
    }
  } else {
    logoutAuthService();
  }

  navigate('/');
};
```

---

## Step 6: Optional - Persist Auth State (2 minutes)

In your `AuthContext` or `useAuth` hook:

```typescript
import { guestAccountService } from '@/services/guestAccountService';

// On app initialization:
useEffect(() => {
  // Check if user has guest account
  if (guestAccountService.isGuestUser()) {
    const status = guestAccountService.getGuestAccountStatus();
    
    if (status.isExpired) {
      // Show renewal prompt
      showRenewalPrompt();
    } else {
      // Set guest user in auth context
      setUser({
        id: status.account?.id,
        displayName: status.account?.displayName,
        isGuest: true,
      });
    }
  }
}, []);
```

---

## Step 7: Implement Guest Data Storage (Optional, 3 minutes)

When users update their profile/data:

```typescript
import { guestAccountService } from '@/services/guestAccountService';

// Save any data to guest account
const saveUserData = (data: any) => {
  if (guestAccountService.isGuestUser()) {
    guestAccountService.saveGuestData('userProgress', data);
  }
};

// Get guest data
const getUserData = () => {
  if (guestAccountService.isGuestUser()) {
    return guestAccountService.getGuestData('userProgress');
  }
};

// Update profile
const updateProfile = (profile: any) => {
  if (guestAccountService.isGuestUser()) {
    guestAccountService.updateGuestProfile(profile);
  }
};
```

---

## Step 8: Firebase Integration (Optional, 5 minutes)

When user upgrades from guest to full account:

```typescript
import { guestAccountService } from '@/services/guestAccountService';

export const upgradeGuestToFullAccount = async (email: string, password: string) => {
  try {
    // Get migration data before clearing
    const migration = guestAccountService.getDataForMigration();
    
    if (!migration) {
      throw new Error('No guest account found');
    }

    // Create Firebase account
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    
    const uid = userCredential.user?.uid;
    if (!uid) throw new Error('Failed to create account');

    // Migrate data to Firebase
    const db = getFirestore();
    
    // Store migration metadata
    await setDoc(doc(db, 'users', uid, 'metadata', 'guestMigration'), {
      migratedFrom: migration.guestAccount.id,
      migratedAt: migration.timestamp,
      renewalCount: migration.guestAccount.renewalCount,
    });

    // Store all guest data
    await setDoc(doc(db, 'users', uid, 'data', 'imported'), {
      guestData: migration.guestData,
      importedAt: migration.timestamp,
    });

    // Update user profile
    await setDoc(
      doc(db, 'users', uid),
      {
        displayName: migration.guestAccount.displayName,
        email: migration.guestAccount.email,
        profileData: migration.guestAccount.profileData,
        createdAt: migration.guestAccount.createdAt,
      },
      { merge: true }
    );

    // Clear guest account
    guestAccountService.clearGuestAccount();

    // Return user
    return userCredential.user;
  } catch (error) {
    console.error('Error upgrading guest account:', error);
    throw error;
  }
};
```

---

## Step 9: Add Analytics Tracking (Optional, 3 minutes)

Track guest account events:

```typescript
import { guestAccountService } from '@/services/guestAccountService';

// Track guest creation
export const trackGuestCreated = (displayName: string) => {
  analytics.logEvent('guest_account_created', {
    display_name: displayName,
    timestamp: new Date().toISOString(),
  });
};

// Track renewal
export const trackGuestRenewed = () => {
  const status = guestAccountService.getGuestAccountStatus();
  analytics.logEvent('guest_account_renewed', {
    renewal_count: status.renewalCount,
    timestamp: new Date().toISOString(),
  });
};

// Track upgrade
export const trackGuestUpgrade = () => {
  const status = guestAccountService.getGuestAccountStatus();
  analytics.logEvent('guest_upgrade_started', {
    days_held: Math.floor(
      (Date.now() - (status.account?.createdAt || 0)) / (24 * 60 * 60 * 1000)
    ),
    renewal_count: status.renewalCount,
    timestamp: new Date().toISOString(),
  });
};
```

---

## 🧪 Quick Test Checklist

```
✓ Create guest account with name and email
✓ Verify guest status shows in dashboard
✓ Check 7-day expiration calculation
✓ Test renewal (should add 7 days)
✓ Test multiple renewals
✓ Verify data persists after page reload
✓ Test expiration warning at day 6
✓ Test upgrade flow
✓ Verify data migrates to Firebase
✓ Verify guest account cleared after upgrade
```

---

## 🐛 Troubleshooting

### Guest account not appearing

**Problem**: Created guest account but not showing up

**Solution**:
```typescript
// Check if guest exists
const status = guestAccountService.getGuestAccountStatus();
console.log('Is guest?', status.isGuest);
console.log('Status:', status);
```

### Data not persisting

**Problem**: Guest data disappears after reload

**Solution**:
```typescript
// Make sure you're saving to service
guestAccountService.saveGuestData('key', value);

// Verify it's saved
const saved = guestAccountService.getGuestData('key');
console.log('Saved data:', saved);
```

### Migration not working

**Problem**: Firebase integration failing

**Solution**:
```typescript
// Verify migration data exists
const migration = guestAccountService.getDataForMigration();
console.log('Migration data:', migration);

// Check Firebase security rules allow write
// Check user is authenticated
// Check database connection
```

---

## 📚 Additional Resources

- **Full Specification**: See `GUEST_ACCOUNT_SYSTEM_SPECIFICATION.md`
- **Component API**: See inline JSDoc in components
- **Service API**: See inline JSDoc in service
- **Examples**: See this guide for common patterns

---

## 🎉 You're Done!

Your app now has a fully functional guest account system!

### Next Steps:
1. Test the implementation thoroughly
2. Customize styling to match your brand
3. Add analytics tracking
4. Implement Firebase migration
5. Deploy to staging
6. Gather user feedback
7. Deploy to production

---

**Guest Account System - Ready to Go!**

Questions? Check the full specification or the inline documentation in the code.
