import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/formatters';
import ActivityCard from './ActivityCard';
import ActivityModal from './ActivityModal';
import { deleteActivity } from '../../api/activities';

export default function DayCard({ day, canEdit, tripId, onActivityAdded, onActivityUpdated, onActivityDeleted, socketEmit }) {
  const [collapsed, setCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const handleSaved = (activity, isEdit) => {
    if (isEdit) { onActivityUpdated(activity); socketEmit?.('activity_updated', { tripId, activity }); }
    else { onActivityAdded(activity, day.day_index); socketEmit?.('activity_added', { tripId, activity, dayIndex: day.day_index }); }
  };

  const handleDelete = async (activityId) => {
    if (!confirm('Delete this activity?')) return;
    try { await deleteActivity(activityId); onActivityDeleted(activityId, day.day_index); socketEmit?.('activity_deleted', { tripId, activityId, dayIndex: day.day_index }); }
    catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  const totalCost = day.activities?.reduce((s, a) => s + (parseFloat(a.cost) || 0), 0) || 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setCollapsed(!collapsed)}>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{day.day_index + 1}</span>
            <span className="font-semibold text-gray-900">{formatDate(day.date)}</span>
          </div>
          <div className="ml-9 text-xs text-gray-500 mt-0.5">{day.activities?.length || 0} activities{totalCost > 0 && ` · $${totalCost.toFixed(2)}`}</div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && <button onClick={(e) => { e.stopPropagation(); setCollapsed(false); setModalOpen(true); }} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Add activity"><Plus size={16} /></button>}
          {collapsed ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
        </div>
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
              {day.notes && <p className="text-sm text-gray-500 italic pt-3">{day.notes}</p>}
              {day.activities?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No activities yet.{' '}{canEdit && <button onClick={() => setModalOpen(true)} className="text-blue-600 hover:underline">Add one</button>}</p>}
              {day.activities?.map((a) => <ActivityCard key={a.id} activity={a} canEdit={canEdit} onEdit={(act) => { setEditingActivity(act); setModalOpen(true); }} onDelete={handleDelete} tripId={tripId} />)}
              {canEdit && day.activities?.length > 0 && (
                <button onClick={() => setModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200"><Plus size={14} />Add activity</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ActivityModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingActivity(null); }} onSaved={handleSaved} tripId={tripId} dayIndex={day.day_index} activity={editingActivity} />
    </div>
  );
}
