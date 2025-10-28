// src/components/common/SkipLink.tsx
import { memo } from 'react';

const SkipLink = () => {
  return (
    <>
      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:absolute
          focus:top-0
          focus:left-0
          focus:z-50
          focus:p-4
          focus:bg-blue-600
          focus:text-white
          focus:rounded-r-lg
        "
      >
        Skip to main content
      </a>
      <a
        href="#main-nav"
        className="
          sr-only
          focus:not-sr-only
          focus:absolute
          focus:top-16
          focus:left-0
          focus:z-50
          focus:p-4
          focus:bg-blue-600
          focus:text-white
          focus:rounded-r-lg
        "
      >
        Skip to navigation
      </a>
    </>
  );
};

export default memo(SkipLink);
