import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Microscope, 
  ShoppingBasket, 
  Truck, 
  Phone, 
  Users, 
  BanknoteIcon, 
  User, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const [user, setUser] = useState(null);
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
    localStorage.removeItem('session_id');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <div className="w-64 bg-agritech-darkGreen text-white min-h-screen flex flex-col shadow-lg">
      <div className="p-4 sm:p-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <span className="text-agritech-green font-bold text-lg">A</span>
          </div>
          <span className="ml-3 text-xl font-semibold">AgriTech</span>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 sm:px-4 sm:py-6">
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/disease-detection" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Microscope className="h-5 w-5 mr-3" />
              Disease Detection
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/market-home" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <ShoppingBasket className="h-5 w-5 mr-3" />
              Market & Sales
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/expert-connect" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Phone className="h-5 w-5 mr-3" />
              Expert Connect
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/community" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Users className="h-5 w-5 mr-3" />
              Farmer Community
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/investments" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <BanknoteIcon className="h-5 w-5 mr-3" />
              Investments & Loans
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <User className="h-5 w-5 mr-3" />
              My Profile
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 sm:p-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-sm sm:text-base">{user ? getInitials(user.name) : ''}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user ? user.name : 'Loading...'}</p>
              <p className="text-xs text-white/70 capitalize">{user ? user.role : ''}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;