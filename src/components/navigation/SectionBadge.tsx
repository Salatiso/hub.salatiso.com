// src/components/navigation/SectionBadge.tsx
import { memo } from 'react';
import { NavBadge } from '../../types/navigation.types';
import { BADGE_STYLES } from '../../config/navigation.config';

interface SectionBadgeProps {
  badge: NavBadge;
}

export const SectionBadge: React.FC<SectionBadgeProps> = memo(({ badge }) => {
  const styles = BADGE_STYLES[badge.type] || BADGE_STYLES.external;

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        whitespace-nowrap
        ${styles}
      `}
      aria-label={`${badge.text} feature`}
    >
      {badge.text}
    </span>
  );
});

SectionBadge.displayName = 'SectionBadge';

export default SectionBadge;
