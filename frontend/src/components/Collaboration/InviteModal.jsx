import React, { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inviteCollaborator } from '../../api/collaborations';

export default function InviteModal({ isOpen, onClose, tripId, onInvited }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    setError(''); setSuccess(''); setLoading(true);
    try { await inviteCollaborator(tripId, { email, role }); setSuccess(`Invitation sent to ${email}`); setEmail(''); onInvited?.(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to invite'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold flex items-center gap-2"><UserPlus size={18} />Invite Collaborator</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
              {success && <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">{success}</div>}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="collaborator@example.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
                  <option value="editor">Editor — can add/edit activities</option>
                  <option value="viewer">Viewer — read only</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading && <Loader2 size={14} className="animate-spin" />}{loading ? 'Inviting...' : 'Send Invite'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
