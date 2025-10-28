
import { Link } from 'react-router-dom';
import { Grid3X3, Shield, Car, Wrench, Users, Phone, Briefcase, Mail, ChevronRight, ChevronLeft, User, FileText, Calendar, Package, TrendingUp, Home } from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Grid3X3 },
    { name: 'Instant Trust', path: '/instant-trust', icon: Shield },
    { name: 'Universal Trust', path: '/universal-trust', icon: Shield },
    { name: 'Emergency Sync', path: '/emergency-sync', icon: Shield },
    { name: 'Household Management', path: '/household-management', icon: Users },
    { name: 'Incident Reporting', path: '/incident-reporting', icon: Phone },
    { name: 'Ride Sharing', path: '/ride-sharing', icon: Car },
    { name: 'Hitchhiking Safety', path: '/hitchhiking-safety', icon: Car },
    { name: 'Delivery Services', path: '/delivery-services', icon: Car },
    { name: 'Home Services', path: '/home-services', icon: Wrench },
    { name: 'Property Management', path: '/property-management', icon: Briefcase },
    { name: 'Local Networking', path: '/local-networking', icon: Users },
    { name: 'Event Safety', path: '/event-safety', icon: Users },
    { name: 'Community Support', path: '/community-support', icon: Users },
    { name: 'Family Tree', path: '/family-tree', icon: Users },
    { name: 'SafetyHelp', path: '/safety-help', icon: Phone },
    { name: 'Emergency Assistance', path: '/emergency-assistance', icon: Phone },
    { name: 'Professional Dashboard', path: '/professional-dashboard', icon: Briefcase },
    { name: 'Contact', path: '/contact', icon: Mail },
    
    // Phase 2: New Pages
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'LifeCV', path: '/lifecv', icon: FileText },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Assets', path: '/assets', icon: Package },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Career Paths', path: '/career-paths', icon: TrendingUp },
    { name: 'Family', path: '/family', icon: Home },
  ];

  if (isCollapsed) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={onToggle}
          className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
          title="Expand Navigation"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white shadow-xl">
      <div className="flex items-center justify-between h-20 px-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">LifeSync</h1>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white p-2 rounded-md transition-colors"
          title="Collapse Navigation"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            <item.icon className="w-6 h-6 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
