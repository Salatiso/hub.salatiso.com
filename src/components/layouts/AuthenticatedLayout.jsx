/**
 * AuthenticatedLayout Component
 * Used for all protected and authenticated pages
 * Features:
 * - Sidebar (shown for authenticated users)
 * - Dashboard Header (with user menu)
 * - Full dashboard experience
 * - Footer
 */

import { Suspense, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ModernSidebar from '../ModernSidebar';
import DashboardHeader from '../DashboardHeader';
import Footer from '../Footer';
import LoadingSpinner from '../LoadingSpinner';
import { useTheme } from '../../contexts/ThemeContext';
import { shouldShowSidebar, getMainContentMargin } from '../../utils/routeConfig';
import { useAuth } from '../../contexts/AuthContext';

const AuthenticatedLayout = ({ children }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const persisted = localStorage.getItem('ls.sidebarCollapsed');
      return persisted === 'true' ? true : false; // Default to false (expanded)
    } catch {
      return false; // Default to expanded on error
    }
  });

  // Determine if sidebar should be visible on this route
  const showSidebar = shouldShowSidebar(location.pathname, !!user);
  const contentMargin = getMainContentMargin(showSidebar, sidebarCollapsed);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ls.sidebarCollapsed', String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar - Only visible if showSidebar is true */}
      {showSidebar && (
        <div className="fixed left-0 top-0 h-screen z-40">
          <ModernSidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
        </div>
      )}
      
      {/* Main content area with dynamic margin based on sidebar */}
      <div className={`flex flex-col flex-1 ${contentMargin} transition-all duration-300 max-lg:ml-0`}>
        {/* Dashboard Header - With user menu and theme toggle */}
        <DashboardHeader onSidebarToggle={handleSidebarToggle} sidebarCollapsed={sidebarCollapsed} />
        
        {/* Page content */}
        <main className="flex-1 pt-4" id="main-content">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
