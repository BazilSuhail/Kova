const DAY_MS = 86_400_000;

export function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysFromToday(date: Date): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / DAY_MS);
}

export function isOverdue(value: string | undefined): boolean {
  const date = parseDate(value);
  return date ? startOfDay(date).getTime() < startOfDay(new Date()).getTime() : false;
}

export function formatDueDate(value: string | undefined): string | null {
  const date = parseDate(value);
  if (!date) return null;

  const days = daysFromToday(date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatDateTime(value: string | undefined): string | null {
  const date = parseDate(value);
  if (!date) return null;

  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const days = daysFromToday(date);
  if (days === 0) return `Today, ${time}`;
  if (days === -1) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${time}`;
}

export function relativeTime(value: string | undefined): string | null {
  const date = parseDate(value);
  if (!date) return null;

  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function todayIsoDate(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addDays(iso: string, n: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day + n);
  const nextMonth = `${date.getMonth() + 1}`.padStart(2, '0');
  const nextDay = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

export function dayLabel(iso: string): string {
  if (iso === todayIsoDate()) return 'Today';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
  });
}

export function shortDate(iso: string | undefined): string {
  if (!iso) return '';
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

export function initialsOf(name: string | undefined, fallback = '?'): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return `${first}${last}`.toUpperCase() || fallback;
}
