// LifeSync Shared Components Library
// Main entry point for all shared components and utilities

// Core Components
export { default as IDVerification } from './components/IDVerification.jsx';
export { default as FacialRecognition } from './components/FacialRecognition.jsx';
export { default as SafetyInteractionFlow } from './components/SafetyInteractionFlow.jsx';
export { default as FloatingToolbar } from './components/FloatingToolbar.jsx';
export { default as TermsOfReciprocityModal } from './components/TermsOfReciprocityModal.jsx';
export { default as TripFacialLog } from './components/TripFacialLog.jsx';

// Contexts
export { default as GuestContext } from './contexts/GuestContext.jsx';
// export { default as ThemeContext } from './contexts/ThemeContext';

// Hooks
// export { default as useIDValidation } from './hooks/useIDValidation';
// export { default as useFacialRecognition } from './hooks/useFacialRecognition';

// Utils
// export * from './utils/validation';
// export * from './utils/constants';

// Version and metadata
export const VERSION = '1.0.0';
export const AUTHOR = 'Salatiso Ecosystem';
export const HOMEPAGE = 'https://lifesync-lifecv.web.app';
