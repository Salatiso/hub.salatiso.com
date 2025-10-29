import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectLocalStorageProfiles } from '../services/migrationService';

/**
 * MigrationChecker - Checks if user needs to migrate from Phase 1 to Phase 2
 *
 * This component runs on app startup and redirects to migration if needed.
 * It should be placed early in the component tree, before main routing.
 */
const MigrationChecker = ({ children }) => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkMigration = async () => {
      try {
        // Check if migration is needed
        const { hasLegacyData } = detectLocalStorageProfiles();

        if (hasLegacyData) {
          // Redirect to migration page
          navigate('/migrate', { replace: true });
          return;
        }

        // No migration needed, continue normally
        setChecked(true);
      } catch (error) {
        console.error('Migration check failed:', error);
        // On error, continue normally (don't block the app)
        setChecked(true);
      }
    };

    checkMigration();
  }, [navigate]);

  // Show loading while checking, or render children if no migration needed
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking for data migration...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default MigrationChecker;