import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setError(''); setLoading(true);
    try { await register(form.username, form.email, form.password); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3"><Plane size={24} className="text-white rotate-45" /></div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Username</label><input name="username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} className="input" placeholder="traveler123" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input" placeholder="you@example.com" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="input" placeholder="Min. 6 characters" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label><input type="password" value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} className="input" placeholder="••••••••" required /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading && <Loader2 size={16} className="animate-spin" />}{loading ? 'Creating...' : 'Create account'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Already have an account?{' '}<Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link></p>
      </motion.div>
    </div>
  );
}
