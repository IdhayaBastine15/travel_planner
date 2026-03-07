import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, Map, Edit2, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTrip, updateTrip, deleteTrip } from '../api/trips';
import { getCollaborators, removeCollaborator } from '../api/collaborations';
import { formatDate, formatCurrency, STATUS_STYLES, getDaysCount } from '../utils/formatters';
import InviteModal from '../components/Collaboration/InviteModal';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getTrip(id), getCollaborators(id)])
      .then(([t, c]) => { setTrip(t.data); setCollaborators(c.data); setEditForm({ title: t.data.title, destination: t.data.destination, start_date: t.data.start_date?.split('T')[0], end_date: t.data.end_date?.split('T')[0], description: t.data.description||'', budget: t.data.budget||'', status: t.data.status }); })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = trip?.my_role === 'owner';
  const canEdit = ['owner','editor'].includes(trip?.my_role);

  const handleSave = async () => {
    setSaving(true);
    try { const res = await updateTrip(id, { ...editForm, budget: editForm.budget ? parseFloat(editForm.budget) : 0 }); setTrip((p) => ({ ...p, ...res.data })); setEditing(false); }
    catch (err) { alert(err.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDeleteTrip = async () => {
    if (!confirm('Delete this trip permanently?')) return;
    try { await deleteTrip(id); navigate('/dashboard'); } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  const handleRemoveCollab = async (userId) => {
    if (!confirm('Remove this collaborator?')) return;
    try { await removeCollaborator(id, userId); setCollaborators((p) => p.filter((c) => c.id !== userId)); } catch (err) { alert(err.response?.data?.error || 'Failed to remove'); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-96"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;
  if (!trip) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="input" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Destination</label><input value={editForm.destination} onChange={(e) => setEditForm((p) => ({ ...p, destination: e.target.value }))} className="input" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={editForm.start_date} onChange={(e) => setEditForm((p) => ({ ...p, start_date: e.target.value }))} className="input" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={editForm.end_date} onChange={(e) => setEditForm((p) => ({ ...p, end_date: e.target.value }))} className="input" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))} className="input"><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option></select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Budget</label><input type="number" value={editForm.budget} onChange={(e) => setEditForm((p) => ({ ...p, budget: e.target.value }))} className="input" min="0" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className="input resize-none" rows={2} /></div>
            <div className="flex gap-3"><button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="btn-primary">{saving && <Loader2 size={14} className="animate-spin" />}Save Changes</button></div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1"><h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1><span className={`badge ${STATUS_STYLES[trip.status]}`}>{trip.status}</span></div>
                <div className="flex items-center gap-1.5 text-gray-500"><MapPin size={15} /><span>{trip.destination}</span></div>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)} className="btn-secondary text-sm"><Edit2 size={14} />Edit</button>
                  {isOwner && <button onClick={handleDeleteTrip} className="btn-danger text-sm"><Trash2 size={14} /></button>}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { icon: Calendar, label: 'Dates', value: formatDate(trip.start_date), sub: `to ${formatDate(trip.end_date)}` },
                { icon: Calendar, label: 'Duration', value: `${getDaysCount(trip.start_date, trip.end_date)} days` },
                { icon: DollarSign, label: 'Budget', value: trip.budget > 0 ? formatCurrency(trip.budget) : '—' },
                { icon: Users, label: 'Team', value: `${collaborators.length} member${collaborators.length !== 1 ? 's' : ''}` },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1"><Icon size={13} />{label}</div>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                  {sub && <p className="text-xs text-gray-500">{sub}</p>}
                </div>
              ))}
            </div>
            {trip.description && <p className="text-gray-600 text-sm mb-4">{trip.description}</p>}
            <div className="flex gap-3">
              <Link to={`/trips/${id}/itinerary`} className="btn-primary text-sm"><Map size={15} />View Itinerary</Link>
              <Link to={`/trips/${id}/budget`} className="btn-secondary text-sm"><DollarSign size={15} />Budget</Link>
            </div>
          </>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Collaborators</h2>
          {isOwner && <button onClick={() => setInviteOpen(true)} className="btn-secondary text-sm"><UserPlus size={15} />Invite</button>}
        </div>
        <div className="space-y-3">
          {collaborators.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">{c.username?.[0]?.toUpperCase()}</div>
                <div><p className="text-sm font-medium text-gray-800">{c.username}</p><p className="text-xs text-gray-500">{c.email}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${c.role==='owner'?'bg-blue-100 text-blue-700':c.role==='editor'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{c.role}</span>
                {isOwner && c.role !== 'owner' && <button onClick={() => handleRemoveCollab(c.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} tripId={id} onInvited={() => getCollaborators(id).then((r) => setCollaborators(r.data))} />
    </div>
  );
}
