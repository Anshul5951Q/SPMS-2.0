import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Car, Calendar, CreditCard, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', icon: <Home size={20} />, path: '/' },
    { label: 'Find Parking', icon: <Car size={20} />, path: '/parking' },
    { label: 'My Reservations', icon: <Calendar size={20} />, path: '/reservations', requireAuth: true },
    { label: 'Payment History', icon: <CreditCard size={20} />, path: '/payments', requireAuth: true },
    { label: 'Profile', icon: <User size={20} />, path: '/profile', requireAuth: true },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings', requireAuth: true },
  ];
  
  const filteredNavItems = navItems.filter(item => 
    !item.requireAuth || (item.requireAuth && isAuthenticated)
  );

  // Handle sidebar on mobile
  const sidebarBaseClass = 'fixed top-[57px] left-0 bottom-0 z-10 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform';
  const sidebarOpenClass = 'translate-x-0';
  const sidebarClosedClass = '-translate-x-full md:translate-x-0';
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={`${sidebarBaseClass} ${isOpen ? sidebarOpenClass : sidebarClosedClass}`}>
        <nav className="flex flex-col px-4 py-6 h-full">
          <div className="space-y-1">
            {filteredNavItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          
          <div className="mt-auto">
            <div className="border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-500 mb-2">App Version 1.0.0</div>
              <div className="text-xs text-gray-500">© 2025 ParkEase</div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;