// src/components/navigation/NavItem.tsx
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NavItem as NavItemType } from '../../types/navigation.types';
import SectionBadge from './SectionBadge';
import { COLORS } from '../../config/navigation.config';

interface NavItemProps {
  item: NavItemType;
  nested?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ item, nested = false }) => {
  const location = useLocation();
  const IconComponent = (Icons as any)[item.icon] || Icons.ChevronRight;

  // Extract path without query params for comparison
  const basePathname = item.path.split('?')[0];
  const isActive = location.pathname === basePathname;

  const itemClasses = `
    flex items-center gap-2 px-3 py-2 rounded-lg
    transition-all duration-150
    ${isActive
      ? `${COLORS.active} ${COLORS.text.primary} font-medium`
      : `${COLORS.text.secondary} ${COLORS.hover}`
    }
    ${nested ? 'ml-4 text-sm' : ''}
    hover:translate-x-0.5
  `;

  const content = (
    <>
      <IconComponent className={`flex-shrink-0 ${nested ? 'w-4 h-4' : 'w-5 h-5'}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && <SectionBadge badge={item.badge} />}
      {item.external && <Icons.ExternalLink className="w-3 h-3 flex-shrink-0" />}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClasses}
        title={item.description}
        aria-label={`${item.label} (opens in new window)`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={item.path}
      className={itemClasses}
      title={item.description}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
};

export default NavItem;
