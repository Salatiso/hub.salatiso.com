// src/components/navigation/Sidebar.tsx
import { Menu, X } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useNavigation } from '../../hooks/useNavigation';
import { NAV_STRUCTURE, BOTTOM_ITEMS, COLORS } from '../../config/navigation.config';
import NavSection from './NavSection';
import BottomNav from './BottomNav';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const { state, toggleSection, setMobileOpen } = useNavigation();

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Sidebar Overlay (Mobile) */}
      {isMobile && state.mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          ${COLORS.background}
          fixed left-0 top-0 h-screen w-72 border-r ${COLORS.border}
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          z-40
          ${isMobile && !state.mobileOpen ? '-translate-x-full' : 'translate-x-0'}
          ${className}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">LifeSync</h2>
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="py-4">
          {NAV_STRUCTURE.map((section) => (
            <NavSection
              key={section.id}
              section={section}
              isExpanded={state.expandedSections[section.id] || false}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </nav>

        {/* Bottom Items */}
        <BottomNav items={BOTTOM_ITEMS} onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
};

export default Sidebar;
