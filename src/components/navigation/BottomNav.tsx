// src/components/navigation/BottomNav.tsx
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { BottomItem } from '../../types/navigation.types';
import { COLORS } from '../../config/navigation.config';

interface BottomNavProps {
  items: BottomItem[];
  onClose?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, onClose }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: BottomItem) => {
    if (item.action === 'logout') {
      // Handle logout
      localStorage.clear();
      navigate('/logout');
    } else {
      navigate(item.path);
    }
    onClose?.();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-900/50 p-2">
      {items.map((item) => {
        if (item.divider) {
          return (
            <div
              key="divider"
              className="h-px bg-slate-700 my-2"
              aria-hidden="true"
            />
          );
        }

        const IconComponent = (Icons as any)[item.icon] || Icons.ChevronRight;

        return (
          <button
            key={item.path}
            onClick={() => handleItemClick(item)}
            className={`
              w-full flex items-center gap-2 px-3 py-2 rounded-lg
              text-sm font-medium
              ${COLORS.text.secondary} ${COLORS.hover}
              transition-colors
            `}
            aria-label={item.label}
          >
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
