/**
 * Dashboard Page - Phase 2.7
 * Main dashboard view that displays all widgets with search infrastructure
 */

import { useState } from 'react';
import { WidgetsLayout } from '../components/widgets';
import SearchBar from '../components/SearchBar';
import { getResponsivePageWrapper, getPageContainerClasses } from '../utils/layoutHelpers';
import { guestAccountService } from '../services/guestAccountService';
import { GuestStatusBadge } from '../components/GuestAuthStatus';
import { GuestUpgradePrompt } from '../components/GuestBenefitsPromo';
import { DashboardTasks } from '../components/DashboardTasks';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isGuest = guestAccountService.isGuestUser();

  const handleSearch = (query) => {
    setSearchQuery(query);
    // TODO: Phase 3 - Implement full-text search across all widgets
    console.log('Search query:', query);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  return (
    <div className={getResponsivePageWrapper({ bgGradient: true })}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Title and Description */}
          <div className="mb-4 sm:mb-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Welcome back! Here's an overview of your LifeSync
                </p>
              </div>
              {isGuest && <GuestStatusBadge compact={true} />}
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 min-w-0 sm:max-w-xs">
              <SearchBar
                onSearch={handleSearch}
                onClear={handleSearchClear}
                placeholder="Search LifeSync..."
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium self-start sm:self-auto"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={getPageContainerClasses()}>
        {isGuest && (
          <div className="mb-6">
            <GuestUpgradePrompt variant="banner" />
          </div>
        )}
        <DashboardTasks />
        <WidgetsLayout />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              LifeSync v1.0 • Powered by Salatiso Ecosystem
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
