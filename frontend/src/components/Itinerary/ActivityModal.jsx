import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addActivity, updateActivity } from '../../api/activities';

const EMPTY = { title: '', category: 'other', start_time: '', end_time: '', location_name: '', cost: '', notes: '' };

export default function ActivityModal({ isOpen, onClose, onSaved, tripId, dayIndex, activity }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!activity;

  useEffect(() => {
    if (activity) setForm({ title: activity.title||'', category: activity.category||'other', start_time: activity.start_time||'', end_time: activity.end_time||'', location_name: activity.location_name||'', cost: activity.cost !== undefined ? String(activity.cost) : '', notes: activity.notes||'' });
    else setForm(EMPTY);
    setError('');
  }, [activity, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setLoading(true); setError('');
    try {
      const payload = { ...form, cost: form.cost ? parseFloat(form.cost) : 0 };
      const result = isEdit ? await updateActivity(activity.id, payload) : await addActivity(tripId, dayIndex, payload);
      onSaved(result.data, isEdit); onClose();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save activity'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{isEdit ? 'Edit Activity' : 'Add Activity'}</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input name="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="input" placeholder="Visit Eiffel Tower" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input">
                  <option value="food">Food & Dining</option><option value="stay">Accommodation</option><option value="travel">Transport</option><option value="sightseeing">Sightseeing</option><option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><input type="time" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} className="input" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><input type="time" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} className="input" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input value={form.location_name} onChange={(e) => setForm((p) => ({ ...p, location_name: e.target.value }))} className="input" placeholder="Eiffel Tower, Paris" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Cost (USD)</label><input type="number" value={form.cost} onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))} className="input" placeholder="0" min="0" step="0.01" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="input resize-none" rows={3} /></div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading && <Loader2 size={14} className="animate-spin" />}{loading ? 'Saving...' : isEdit ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
