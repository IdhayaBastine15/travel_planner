import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Trash2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateShort, getDaysCount, STATUS_STYLES } from '../../utils/formatters';

export default function TripCard({ trip, onDelete, onDuplicate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card hover:shadow-md transition-shadow">
      <Link to={`/trips/${trip.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{trip.title}</h3>
          <span className={`badge ${STATUS_STYLES[trip.status] || STATUS_STYLES.draft} shrink-0`}>{trip.status}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2"><MapPin size={14} className="shrink-0" /><span className="truncate">{trip.destination}</span></div>
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
          <Calendar size={14} className="shrink-0" />
          <span>{formatDateShort(trip.start_date)} – {formatDateShort(trip.end_date)}</span>
          <span className="text-gray-400">({getDaysCount(trip.start_date, trip.end_date)} days)</span>
        </div>
        {trip.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{trip.description}</p>}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1"><Users size={12} /><span>{trip.my_role}</span></div>
          <span>by {trip.owner_username}</span>
        </div>
      </Link>
      <div className="px-5 pb-4 flex gap-2 border-t border-gray-50 pt-3">
        <button onClick={() => onDuplicate(trip.id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"><Copy size={14} />Duplicate</button>
        {trip.my_role === 'owner' && (
          <button onClick={() => onDelete(trip.id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors ml-auto"><Trash2 size={14} />Delete</button>
        )}
      </div>
    </motion.div>
  );
}
