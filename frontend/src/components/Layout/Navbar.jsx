import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          {onMenuToggle && <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-gray-100 md:hidden"><Menu size={20} /></button>}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
            <Plane size={22} className="rotate-45" /><span>TravelPlanner</span>
          </Link>
        </div>
        {user && (
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">{user.username?.[0]?.toUpperCase()}</div>
              <span className="text-sm font-medium hidden sm:block">{user.username}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">{user.email}</div>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut size={16} />Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
