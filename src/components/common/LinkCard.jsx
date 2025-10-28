import { memo } from 'react';

/**
 * LinkCard Component
 * Displays a link card with title and description
 * Memoized to prevent unnecessary re-renders
 */
function LinkCard({ href, title, description }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-5 rounded-lg border bg-white/70 dark:bg-gray-800/60 hover:border-primary-500 hover:shadow transition-colors block"
    >
      <h4 className="font-semibold mb-1 text-primary-700 dark:text-primary-300">
        {title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </a>
  );
}

export default memo(LinkCard);
