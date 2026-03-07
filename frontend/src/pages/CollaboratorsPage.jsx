import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Trash2, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCollaborators, changeRole, removeCollaborator } from '../api/collaborations';
import { getTrip } from '../api/trips';
import InviteModal from '../components/Collaboration/InviteModal';

const ROLE_STYLES = {
  owner: 'bg-blue-100 text-blue-700',
  editor: 'bg-green-100 text-green-700',
  viewer: 'bg-gray-100 text-gray-600',
};

export default function CollaboratorsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [changingRole, setChangingRole] = useState(null);

  const fetchData = () =>
    Promise.all([getCollaborators(id), getTrip(id)])
      .then(([c, t]) => { setCollaborators(c.data); setMyRole(t.data.my_role); })
      .catch(() => navigate('/dashboard'));

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [id]);

  const isOwner = myRole === 'owner';

  const handleRoleChange = async (userId, newRole) => {
    setChangingRole(userId);
    try {
      await changeRole(id, userId, newRole);
      setCollaborators((prev) => prev.map((c) => c.id === userId ? { ...c, role: newRole } : c));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to change role');
    } finally {
      setChangingRole(null);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this collaborator?')) return;
    try {
      await removeCollaborator(id, userId);
      setCollaborators((prev) => prev.filter((c) => c.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove collaborator');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <Loader2 size={32} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Collaborators</h1>
          <span className="text-sm text-gray-400">({collaborators.length})</span>
        </div>
        {isOwner && (
          <button onClick={() => setInviteOpen(true)} className="btn-primary text-sm">
            <UserPlus size={15} />Invite
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card divide-y divide-gray-100">
        {collaborators.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {c.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{c.username}</p>
                <p className="text-xs text-gray-500">{c.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOwner && c.role !== 'owner' ? (
                <select
                  value={c.role}
                  disabled={changingRole === c.id}
                  onChange={(e) => handleRoleChange(c.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="editor">editor</option>
                  <option value="viewer">viewer</option>
                </select>
              ) : (
                <span className={`badge flex items-center gap-1 ${ROLE_STYLES[c.role]}`}>
                  {c.role === 'owner' && <Shield size={11} />}{c.role}
                </span>
              )}

              {isOwner && c.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(c.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      <InviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        tripId={id}
        onInvited={fetchData}
      />
    </div>
  );
}
