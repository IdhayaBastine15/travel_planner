import React, { useState, useEffect } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';

export default function CommentThread({ activityId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api.get(`/activities/${activityId}/comments`).then((r) => setComments(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [activityId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try { const res = await api.post(`/activities/${activityId}/comments`, { content }); setComments((p) => [...p, res.data]); setContent(''); } catch (_) {}
    setPosting(false);
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/comments/${id}`); setComments((p) => p.filter((c) => c.id !== id)); } catch (_) {}
  };

  if (loading) return <div className="py-2 text-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto" /></div>;

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">{c.username?.[0]?.toUpperCase()}</div>
          <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-gray-700">{c.username}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                {user?.id === c.user_id && <button onClick={() => handleDelete(c.id)} className="p-0.5 hover:text-red-500 text-gray-400"><Trash2 size={11} /></button>}
              </div>
            </div>
            <p className="text-xs text-gray-700">{c.content}</p>
          </div>
        </div>
      ))}
      <form onSubmit={handlePost} className="flex gap-2 mt-2">
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <button type="submit" disabled={posting || !content.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
    </div>
  );
}
