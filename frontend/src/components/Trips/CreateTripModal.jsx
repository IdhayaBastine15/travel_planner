import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createTrip } from '../../api/trips';

const INITIAL = { title: '', destination: '', start_date: '', end_date: '', description: '', budget: '', status: 'draft' };

export default function CreateTripModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.destination || !form.start_date || !form.end_date) return setError('Title, destination, and dates are required.');
    if (new Date(form.end_date) < new Date(form.start_date)) return setError('End date must be after start date.');
    setLoading(true);
    try {
      const res = await createTrip({ ...form, budget: form.budget ? parseFloat(form.budget) : 0 });
      onCreated(res.data); setForm(INITIAL); onClose();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create trip'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Create New Trip</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Trip Title *</label><input name="title" value={form.title} onChange={handleChange} className="input" placeholder="Summer Europe Adventure" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label><input name="destination" value={form.destination} onChange={handleChange} className="input" placeholder="Paris, France" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label><input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="input" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label><input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label><input type="number" name="budget" value={form.budget} onChange={handleChange} className="input" placeholder="2000" min="0" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="input"><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option></select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={form.description} onChange={handleChange} className="input resize-none" rows={3} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading && <Loader2 size={16} className="animate-spin" />}{loading ? 'Creating...' : 'Create Trip'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
