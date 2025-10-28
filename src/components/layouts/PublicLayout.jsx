/**
 * PublicLayout Component
 * Used for all public pages (/, /auth, /contact, /onboarding, /terms/reciprocity)
 * Features:
 * - NO Sidebar
 * - Public Header (clean, no user menu)
 * - Footer
 * - No authentication required
 */

import { Suspense } from 'react';
import PublicHeader from '../PublicHeader';
import Footer from '../Footer';
import LoadingSpinner from '../LoadingSpinner';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Public Header - No user menu, clean navigation */}
      <PublicHeader />
      
      {/* Main content - Full width, no sidebar */}
      <main className="flex-1" id="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </main>
      
      {/* Footer - Common to all pages */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
