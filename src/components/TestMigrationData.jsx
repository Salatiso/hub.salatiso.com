import { useEffect, useState } from 'react';

/**
 * TestMigrationData - Adds sample Phase 1 profiles to localStorage for testing
 *
 * This component creates test data that simulates Phase 1 localStorage profiles
 * so we can test the migration flow.
 */
const TestMigrationData = () => {
  const [status, setStatus] = useState('Adding test data...');

  useEffect(() => {
    // Sample Phase 1 profile data (localStorage format)
    const sampleProfiles = [
      {
        id: "guest_12345678-1234-1234-1234-123456789abc",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        pin: "1234", // Plaintext PIN (Phase 1 style)
        password: "password123",
        createdAt: Date.now() - 86400000, // 1 day ago
        accountType: "guest"
      },
      {
        id: "guest_87654321-4321-4321-4321-cba987654321",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        pin: "5678", // Plaintext PIN
        createdAt: Date.now() - 172800000, // 2 days ago
        accountType: "guest"
      }
    ];

    try {
      // Store in localStorage (Phase 1 format)
      localStorage.setItem('guestProfile', JSON.stringify(sampleProfiles[0]));
      localStorage.setItem('currentProfile', JSON.stringify(sampleProfiles[1]));

      setStatus('✅ Test profiles added successfully!');

      console.log('✅ Test profiles created in localStorage:');
      console.log('guestProfile:', localStorage.getItem('guestProfile'));
      console.log('currentProfile:', localStorage.getItem('currentProfile'));
      console.log('All localStorage keys:', Object.keys(localStorage));

      // Auto-redirect to migration page after 2 seconds
      setTimeout(() => {
        window.location.href = '/migrate';
      }, 2000);

    } catch (error) {
      setStatus(`❌ Error adding test data: ${error.message}`);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Setting up Test Data</h2>
          <p className="text-gray-600">{status}</p>
        </div>

        <div className="text-sm text-gray-500">
          <p>This page adds sample Phase 1 profiles to localStorage</p>
          <p>Then redirects to the migration component</p>
        </div>
      </div>
    </div>
  );
};

export default TestMigrationData;