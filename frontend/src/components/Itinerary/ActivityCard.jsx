import React, { useState } from 'react';
import { Clock, MapPin, DollarSign, Edit2, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatCurrency, CATEGORY_COLORS } from '../../utils/formatters';
import CommentThread from '../Comments/CommentThread';

const CATEGORY_ICONS = { food: '🍽️', stay: '🏨', travel: '✈️', sightseeing: '🗺️', other: '📌' };

export default function ActivityCard({ activity, canEdit, onEdit, onDelete, tripId }) {
  const [showComments, setShowComments] = useState(false);
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 rounded-full self-stretch shrink-0" style={{ backgroundColor: CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.other }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{CATEGORY_ICONS[activity.category] || '📌'}</span>
                <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onEdit(activity)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => onDelete(activity.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              {(activity.start_time || activity.end_time) && <div className="flex items-center gap-1"><Clock size={13} /><span>{activity.start_time ? formatTime(activity.start_time) : ''}{activity.start_time && activity.end_time ? ' – ' : ''}{activity.end_time ? formatTime(activity.end_time) : ''}</span></div>}
              {activity.location_name && <div className="flex items-center gap-1 min-w-0"><MapPin size={13} className="shrink-0" /><span className="truncate">{activity.location_name}</span></div>}
              {activity.cost > 0 && <div className="flex items-center gap-1"><DollarSign size={13} /><span>{formatCurrency(activity.cost)}</span></div>}
            </div>
            {activity.notes && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{activity.notes}</p>}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-50 px-4 py-2">
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600">
          <MessageSquare size={13} />Comments{showComments ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-3"><CommentThread activityId={activity.id} tripId={tripId} /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
