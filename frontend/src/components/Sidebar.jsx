import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Microscope,
  ShoppingBasket,
  Phone,
  Users,
  BanknoteIcon,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem('sidebarExpanded') !== 'false';
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const sessionId = localStorage.getItem('session_id');
    if (storedUser && sessionId) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', isExpanded);
  }, [isExpanded]);

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      try {
        const response = await fetch('http://localhost:8000/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (!response.ok) throw new Error('Logout failed');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
    localStorage.clear();
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleNavClick = () => {
    if (!isExpanded) setIsExpanded(true);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/disease-detection', label: 'Disease Detection', icon: Microscope },
    { to: '/market-home', label: 'Market & Sales', icon: ShoppingBasket },
    { to: '/expert-consultation', label: 'Expert Connect', icon: Phone },
    { to: '/farmer-requests', label: 'Farmer Community', icon: Users },
    { to: '/investments', label: 'Investments', icon: BanknoteIcon },
  ];

  return (
    <div
      className={`bg-agritech-darkGreen text-white min-h-screen flex flex-col shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      role="navigation"
      aria-label="Main sidebar"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div
          onClick={toggleSidebar}
          className="flex items-center cursor-pointer"
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle sidebar"
        >
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <span className="text-agritech-green font-bold text-lg">{'A'}</span>
          </div>
          {isExpanded && <span className="ml-3 text-xl font-semibold text-white">AgriTech</span>}
        </div>
        {isExpanded && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-agritech-green"
            aria-label="Collapse sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  } ${isExpanded ? 'px-4' : 'justify-center px-0'}`
                }
                title={!isExpanded ? label : ''}
                aria-label={`Go to ${label}`}
              >
                <Icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
                {isExpanded && <span>{label}</span>}
              </NavLink>
            </li>
          ))}

          {isExpanded && (
            <li className="pt-4">
              <div className="px-4 py-2 text-xs text-white/50 uppercase tracking-wide">Account</div>
            </li>
          )}

          <li>
            <NavLink
              to="/profile"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                } ${isExpanded ? 'px-4' : 'justify-center px-0'}`
              }
              title={!isExpanded ? 'My Profile' : ''}
              aria-label="Go to My Profile"
            >
              {isExpanded && <User className="h-5 w-5 mr-3" />}
              {isExpanded ? <span>My Profile</span> : <User className="h-5 w-5" />}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        {isExpanded ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-sm">{user ? getInitials(user.name) : ''}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user ? user.name : 'Loading...'}</p>
                <p className="text-xs text-white/70 capitalize">{user ? user.role : ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-agritech-green"
              title="Logout"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5 text-white/70" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-agritech-green"
              title="Logout"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5 text-white/70" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
