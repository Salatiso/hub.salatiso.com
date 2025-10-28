# @salatiso/lifesync-shared

Shared components and utilities for the Salatiso LifeSync ecosystem. This library provides reusable React components, contexts, hooks, and utilities that can be consumed by all LifeSync ecosystem applications.

## Installation

```bash
npm install @salatiso/lifesync-shared
```

## Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "firebase": "^10.0.0",
  "lucide-react": "^0.294.0"
}
```

## Components

### IDVerification

A comprehensive identity verification component with ID validation, facial recognition, and nationality confirmation.

```jsx
import { IDVerification } from '@salatiso/lifesync-shared';

function MyComponent() {
  const handleVerificationComplete = (verificationData) => {
    console.log('Verification completed:', verificationData);
  };

  return (
    <IDVerification
      onVerificationComplete={handleVerificationComplete}
      context="hitchhiking-safety"
      requireFacial={true}
      requireNationality={true}
    />
  );
}
```

### FacialRecognition

Standalone facial recognition component for biometric verification.

```jsx
import { FacialRecognition } from '@salatiso/lifesync-shared';

function MyComponent() {
  const handleCapture = (captureData) => {
    console.log('Face captured:', captureData);
  };

  return (
    <FacialRecognition
      onCapture={handleCapture}
      userType="participant"
      context="event-safety"
    />
  );
}
```

### SafetyInteractionFlow

Enhanced safety interaction flow with optional facial verification for various interaction types.

```jsx
import { SafetyInteractionFlow } from '@salatiso/lifesync-shared';

function SafetyPage() {
  const participants = [
    { id: '1', name: 'John Doe', role: 'Participant' },
    { id: '2', name: 'Jane Smith', role: 'Coordinator' }
  ];

  return (
    <SafetyInteractionFlow
      interactionType="follow_me_home"
      participants={participants}
      onComplete={(data) => console.log('Safety enhanced:', data)}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

### TripFacialLog

Multi-step facial verification process for trip participants with progress tracking.

```jsx
import { TripFacialLog } from '@salatiso/lifesync-shared';

function VerificationPage() {
  const participants = [
    { id: '1', name: 'Alice', role: 'Driver' },
    { id: '2', name: 'Bob', role: 'Passenger' }
  ];

  return (
    <TripFacialLog
      interactionId="trip_123"
      participants={participants}
      onComplete={(data) => console.log('Verification complete:', data)}
      onSkip={(data) => console.log('Skipped:', data)}
      context="transport_sync"
    />
  );
}
```

### TermsOfReciprocityModal

Comprehensive terms of service modal with expandable sections and scroll tracking.

```jsx
import { TermsOfReciprocityModal } from '@salatiso/lifesync-shared';

function TermsPage() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <TermsOfReciprocityModal
      isOpen={showTerms}
      onClose={() => setShowTerms(false)}
      onAccept={() => console.log('Terms accepted')}
      onDecline={() => console.log('Terms declined')}
    />
  );
}
```

### FloatingToolbar

Quick access toolbar with ID validation and external service links.

```jsx
import { FloatingToolbar } from '@salatiso/lifesync-shared';

function App() {
  return (
    <div>
      {/* Your app content */}
      <FloatingToolbar />
    </div>
  );
}
```

## Contexts

### GuestContext

Context for managing guest user data and verification state.

```jsx
import { GuestContext } from '@salatiso/lifesync-shared';

const guestData = {
  id: 'guest-123',
  verifications: [],
  trustScore: 0,
  // ... other guest data
};

<GuestContext.Provider value={{ guestData, setGuestData }}>
  <App />
</GuestContext.Provider>
```

## Usage in Ecosystem Apps

### Importing Components

```jsx
// In any LifeSync ecosystem app
import {
  IDVerification,
  FacialRecognition,
  GuestContext
} from '@salatiso/lifesync-shared';
```

### Integration with Firebase

The components are designed to work seamlessly with Firebase authentication and data persistence. Make sure your app has Firebase configured:

```jsx
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

## Development

### Building the Library

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Architecture

This shared library follows these principles:

- **Centralized Components**: All core LifeSync features are maintained in one place
- **Consistent API**: Standardized interfaces across all ecosystem apps
- **Peer Dependencies**: Efficient bundling by leveraging host app dependencies
- **TypeScript Support**: Full type definitions for better developer experience
- **Modular Design**: Import only what you need

## Contributing

1. Make changes to components in the `src/` directory
2. Update exports in `src/index.js`
3. Test your changes
4. Build the library: `npm run build`
5. Submit a pull request

## License

MIT

## Support

For support, please visit the [LifeSync documentation](https://lifesync-lifecv.web.app) or create an issue in the [GitHub repository](https://github.com/salatiso-ecosystem/lifesync-shared).
