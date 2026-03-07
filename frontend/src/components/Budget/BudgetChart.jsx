import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_LABELS } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetChart({ totalsByCategory = [], budget = 0, grandTotal = 0 }) {
  if (totalsByCategory.length === 0) return <div className="card p-6 flex items-center justify-center text-gray-400 h-64"><p className="text-sm">No expenses yet</p></div>;
  const data = {
    labels: totalsByCategory.map((t) => CATEGORY_LABELS[t.category] || t.category),
    datasets: [{ data: totalsByCategory.map((t) => parseFloat(t.total)), backgroundColor: totalsByCategory.map((t) => CATEGORY_COLORS[t.category] || '#6b7280'), borderWidth: 2, borderColor: '#fff' }],
  };
  const options = { plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } }, tooltip: { callbacks: { label: (ctx) => ` ${formatCurrency(ctx.parsed)}` } } }, cutout: '65%' };
  const pct = budget > 0 ? Math.min((grandTotal / budget) * 100, 100) : 0;
  const over = budget > 0 && grandTotal > budget;
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Spending Breakdown</h3>
      <div className="max-w-xs mx-auto mb-6"><Doughnut data={data} options={options} /></div>
      {budget > 0 && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Budget progress</span>
            <span className={over ? 'text-red-600 font-medium' : 'text-gray-700'}>{formatCurrency(grandTotal)} / {formatCurrency(budget)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} /></div>
          {over && <p className="text-xs text-red-600 mt-1">Over budget by {formatCurrency(grandTotal - budget)}</p>}
        </div>
      )}
    </div>
  );
}
