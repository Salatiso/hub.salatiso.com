// Test script to create sample localStorage profiles for migration testing
// Run this in browser console to simulate Phase 1 data

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

// Store in localStorage (Phase 1 format)
localStorage.setItem('guestProfile', JSON.stringify(sampleProfiles[0]));
localStorage.setItem('currentProfile', JSON.stringify(sampleProfiles[1]));

console.log('✅ Test profiles created in localStorage:');
console.log('guestProfile:', localStorage.getItem('guestProfile'));
console.log('currentProfile:', localStorage.getItem('currentProfile'));
console.log('All localStorage keys:', Object.keys(localStorage));