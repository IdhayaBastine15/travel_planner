import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, Map, DollarSign, Users, Star } from 'lucide-react';

function TripLinks({ tripId }) {
  const base = `/trips/${tripId}`;
  return (
    <div className="mt-2">
      <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Trip</p>
      {[
        { to: base, icon: LayoutDashboard, label: 'Overview', end: true },
        { to: `${base}/itinerary`, icon: Map, label: 'Itinerary' },
        { to: `${base}/budget`, icon: DollarSign, label: 'Budget' },
        { to: `${base}/collaborators`, icon: Users, label: 'Collaborators' },
      ].map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Icon size={18} />{label}
        </NavLink>
      ))}
    </div>
  );
}

export default function Sidebar({ isOpen }) {
  const { id: tripId } = useParams();
  return (
    <aside className={`fixed top-16 left-0 bottom-0 w-60 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <nav className="py-4 overflow-y-auto h-full">
        <div>
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">General</p>
          {[{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }, { to: '/favorites', icon: Star, label: 'Favorites' }].map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </div>
        {tripId && <TripLinks tripId={tripId} />}
      </nav>
    </aside>
  );
}
