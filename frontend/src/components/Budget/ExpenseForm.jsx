import React, { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { addExpense } from '../../api/expenses';

const INITIAL = { amount: '', category: 'other', date: new Date().toISOString().split('T')[0], description: '' };

export default function ExpenseForm({ tripId, onAdded }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Enter a valid amount');
    setError(''); setLoading(true);
    try { const res = await addExpense(tripId, { ...form, amount: parseFloat(form.amount) }); onAdded(res.data); setForm(INITIAL); }
    catch (err) { setError(err.response?.data?.error || 'Failed to add expense'); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Add Expense</h3>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD) *</label><input type="number" name="amount" value={form.amount} onChange={handleChange} className="input" placeholder="0.00" min="0" step="0.01" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input">
            {['food','stay','travel','sightseeing','other'].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" name="date" value={form.date} onChange={handleChange} className="input" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input name="description" value={form.description} onChange={handleChange} className="input" placeholder="Dinner at..." /></div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{loading ? 'Adding...' : 'Add Expense'}</button>
    </form>
  );
}
