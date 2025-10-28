/**
 * WidgetsLayout Component - Phase 2.6
 * Displays all 9 widgets (5 core + 4 advanced) in responsive grid layout
 */

// Core Widgets
import ProfileWidget from './ProfileWidget';
import LifeCVWidget from './LifeCVWidget';
import ContactsWidget from './ContactsWidget';
import CalendarWidget from './CalendarWidget';
import AssetsWidget from './AssetsWidget';

// Advanced Widgets
import TrustScoreWidget from './TrustScoreWidget';
import ActivityFeedWidget from './ActivityFeedWidget';
import VerificationWidget from './VerificationWidget';
import NotificationsWidget from './NotificationsWidget';

// Support Widgets
import DashboardWidget from './DashboardWidget';
import HealthWidget from './HealthWidget';
import GoalsWidget from './GoalsWidget';
import SettingsWidget from './SettingsWidget';

const WidgetsLayout = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
      {/* ========================================
          SECTION 1: PRIMARY PROFILE & STATUS
          ======================================== */}

      {/* Profile - Left Priority Widget (spans 2 rows, 1 column) */}
      <div className="lg:row-span-2">
        <ProfileWidget />
      </div>

      {/* Trust Score - Right Side Priority */}
      <div>
        <TrustScoreWidget />
      </div>

      {/* Verification Status */}
      <div>
        <VerificationWidget />
      </div>

      {/* Notifications */}
      <div className="md:col-span-1">
        <NotificationsWidget />
      </div>

      {/* ========================================
          SECTION 2: PROFESSIONAL & CAREER
          ======================================== */}

      {/* LifeCV - Professional Data */}
      <div>
        <LifeCVWidget />
      </div>

      {/* Assets - Financial & Resources */}
      <div>
        <AssetsWidget />
      </div>

      {/* Contacts - Network */}
      <div>
        <ContactsWidget />
      </div>

      {/* ========================================
          SECTION 3: ACTIVITY & INSIGHTS
          ======================================== */}

      {/* Activity Feed - Recent Actions (spans 2 columns) */}
      <div className="lg:col-span-2">
        <ActivityFeedWidget />
      </div>

      {/* Calendar - Events & Schedule */}
      <div>
        <CalendarWidget />
      </div>

      {/* ========================================
          SECTION 4: HEALTH & GOALS
          ======================================== */}

      {/* Health Metrics */}
      <div>
        <HealthWidget />
      </div>

      {/* Personal Goals */}
      <div>
        <GoalsWidget />
      </div>

      {/* ========================================
          SECTION 5: OVERVIEW & SETTINGS
          ======================================== */}

      {/* Dashboard Overview (spans full width) */}
      <div className="lg:col-span-4">
        <DashboardWidget />
      </div>

      {/* Quick Settings (spans full width) */}
      <div className="lg:col-span-4">
        <SettingsWidget />
      </div>
    </div>
  );
};

export default WidgetsLayout;
