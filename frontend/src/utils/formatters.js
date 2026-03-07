export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount || 0);
}
export function getDaysCount(start, end) {
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
}
export const CATEGORY_COLORS = { food: '#f59e0b', stay: '#8b5cf6', travel: '#3b82f6', sightseeing: '#10b981', other: '#6b7280' };
export const CATEGORY_LABELS = { food: 'Food & Dining', stay: 'Accommodation', travel: 'Transport', sightseeing: 'Sightseeing', other: 'Other' };
export const STATUS_STYLES = { draft: 'bg-gray-100 text-gray-700', active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700' };
