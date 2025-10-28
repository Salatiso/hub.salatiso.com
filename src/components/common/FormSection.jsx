import { memo } from 'react';

/**
 * FormSection Component
 * Wraps form fields in a styled section with optional title
 * Memoized to prevent unnecessary re-renders
 */
function FormSection({ title, children, className = '', bgClass = 'bg-blue-50 border-blue-200' }) {
  return (
    <div className={`rounded-lg border-2 ${bgClass} p-6 mb-8 ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      {children}
    </div>
  );
}

export default memo(FormSection);
