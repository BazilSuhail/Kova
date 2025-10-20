/**
 * Date and time formatting.
 *
 * The API mixes two shapes: date-only strings (`2026-10-06`) and full ISO timestamps
 * (`2026-10-05T18:00:00+00:00`). A date-only value must never be run through `new Date()`,
 * because that parses as UTC midnight and can render as the previous day in a western
 * timezone — so it is split by hand and rebuilt as local midnight.
 */

const DAY_MS = 86_400_000;

/** Parses either shape, returning `null` for empty or unusable values. */
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

/** Midnight local time, so day comparisons ignore the clock. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysFromToday(date: Date): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / DAY_MS);
}

/** True when a due date sits before today. */
export function isOverdue(value: string | undefined): boolean {
  const date = parseDate(value);
  return date ? startOfDay(date).getTime() < startOfDay(new Date()).getTime() : false;
}

/** "Today", "Tomorrow", "Yesterday", a weekday, or a short date. */
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

/** "2:30 PM", or `null` when the value is not a usable timestamp. */
export function formatTime(value: string | undefined): string | null {
  const date = parseDate(value);
  return date ? date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : null;
}

/** "Today, 2:30 PM" / "Yesterday, 9:00 AM" / "5 Oct, 6:00 PM". */
export function formatDateTime(value: string | undefined): string | null {
  const date = parseDate(value);
  if (!date) return null;

  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const days = daysFromToday(date);
  if (days === 0) return `Today, ${time}`;
  if (days === -1) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${time}`;
}

/** "just now" / "5m ago" / "3h ago" / "2d ago" / a short date. */
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

/** `YYYY-MM-DD` for today, matching what the server stores in `dueDate`. */
export function todayIsoDate(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
