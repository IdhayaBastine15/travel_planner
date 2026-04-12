function parseDate(dateStr) {
  if (!dateStr) return null;
  // Date-only strings (YYYY-MM-DD) are parsed as UTC by default which shifts the
  // day backward in negative-offset timezones. Force local noon to avoid this.
  return dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T12:00:00');
}

export function formatDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
export function formatDateShort(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return 0;
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}
export const CATEGORY_COLORS = { food: '#f59e0b', stay: '#8b5cf6', travel: '#3b82f6', sightseeing: '#10b981', other: '#6b7280' };
export const CATEGORY_LABELS = { food: 'Food & Dining', stay: 'Accommodation', travel: 'Transport', sightseeing: 'Sightseeing', other: 'Other' };
export const STATUS_STYLES = { draft: 'bg-gray-100 text-gray-700', active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700' };
