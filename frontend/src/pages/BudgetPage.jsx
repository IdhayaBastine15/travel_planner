import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Trash2 } from 'lucide-react';
import { getExpenses, deleteExpense } from '../api/expenses';
import { getTrip } from '../api/trips';
import { useSocket } from '../hooks/useSocket';
import ExpenseForm from '../components/Budget/ExpenseForm';
import BudgetChart from '../components/Budget/BudgetChart';
import { formatCurrency, formatDate, CATEGORY_LABELS } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

export default function BudgetPage() {
  const { id: tripId } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [data, setData] = useState({ expenses: [], totals_by_category: [], grand_total: 0 });
  const [loading, setLoading] = useState(true);
  const canEdit = ['owner','editor'].includes(trip?.my_role);

  useSocket(tripId, { expense_logged: (payload) => { if (payload.tripId === tripId) getExpenses(tripId).then((r) => setData(r.data)); } });

  useEffect(() => {
    Promise.all([getTrip(tripId), getExpenses(tripId)])
      .then(([t, e]) => { setTrip(t.data); setData(e.data); })
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleAdded = (expense) => {
    setData((prev) => {
      const newExpenses = [expense, ...prev.expenses];
      const totalsMap = {};
      newExpenses.forEach((e) => { totalsMap[e.category] = (totalsMap[e.category]||0) + parseFloat(e.amount); });
      return { expenses: newExpenses, totals_by_category: Object.entries(totalsMap).map(([category, total]) => ({ category, total })), grand_total: newExpenses.reduce((s, e) => s + parseFloat(e.amount), 0) };
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      setData((prev) => {
        const newExpenses = prev.expenses.filter((e) => e.id !== id);
        const totalsMap = {};
        newExpenses.forEach((e) => { totalsMap[e.category] = (totalsMap[e.category]||0) + parseFloat(e.amount); });
        return { expenses: newExpenses, totals_by_category: Object.entries(totalsMap).map(([category, total]) => ({ category, total })), grand_total: newExpenses.reduce((s, e) => s + parseFloat(e.amount), 0) };
      });
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-96"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6"><h1 className="text-xl font-bold text-gray-900">{trip?.title} — Budget</h1><p className="text-sm text-gray-500">Total spent: <span className="font-semibold text-gray-900">{formatCurrency(data.grand_total)}</span>{trip?.budget > 0 && ` of ${formatCurrency(trip.budget)} budget`}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {canEdit && <ExpenseForm tripId={tripId} onAdded={handleAdded} />}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Expenses</h3></div>
            {data.expenses.length === 0 ? <p className="text-center text-gray-400 py-8 text-sm">No expenses yet</p> : (
              <div className="divide-y divide-gray-50">
                {data.expenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-800">{e.description || CATEGORY_LABELS[e.category] || e.category}</span><span className="badge bg-gray-100 text-gray-600">{e.category}</span></div>
                      <p className="text-xs text-gray-400">{formatDate(e.date)} · by {e.username}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{formatCurrency(e.amount)}</span>
                      {user?.id === e.user_id && <button onClick={() => handleDelete(e.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div><BudgetChart totalsByCategory={data.totals_by_category} budget={parseFloat(trip?.budget)||0} grandTotal={data.grand_total} /></div>
      </div>
    </div>
  );
}
