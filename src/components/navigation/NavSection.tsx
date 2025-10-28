// src/components/navigation/NavSection.tsx
import * as Icons from 'lucide-react';
import { NavSection as NavSectionType } from '../../types/navigation.types';
import NavItem from './NavItem';
import { COLORS } from '../../config/navigation.config';

interface NavSectionProps {
  section: NavSectionType;
  isExpanded: boolean;
  onToggle: () => void;
}

export const NavSection: React.FC<NavSectionProps> = ({
  section,
  isExpanded,
  onToggle
}) => {
  const IconComponent = (Icons as any)[section.icon] || Icons.ChevronRight;

  if (!section.collapsible) {
    // Non-collapsible section (like Dashboard)
    return (
      <div className="px-3 py-2">
        {section.items.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      {/* Section Header/Toggle */}
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`
          w-full flex items-center gap-2 px-3 py-2 rounded-lg
          ${COLORS.hover}
          transition-colors
          text-sm font-medium
          ${isExpanded ? COLORS.active : COLORS.text.secondary}
        `}
        aria-expanded={isExpanded}
        aria-controls={`section-${section.id}`}
        aria-label={`Toggle ${section.label}`}
      >
        <IconComponent className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{section.label}</span>
        <Icons.ChevronRight
          className={`
            w-4 h-4 flex-shrink-0 transition-transform
            ${isExpanded ? 'rotate-90' : ''}
          `}
          aria-hidden="true"
        />
      </button>

      {/* Section Items */}
      {isExpanded && (
        <div
          id={`section-${section.id}`}
          role="region"
          aria-labelledby={`section-${section.id}-heading`}
          className="mt-1 ml-2 space-y-1 border-l border-slate-700"
        >
          {section.items.map((item) => (
            <NavItem key={item.path} item={item} nested />
          ))}
        </div>
      )}
    </div>
  );
};

export default NavSection;
