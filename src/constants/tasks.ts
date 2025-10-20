/**
 * Category presentation shared by the task list, the detail screen and the composer.
 *
 * Categories are free text on the server (manual creates are auto-categorised from keywords),
 * so the tone lookup is case-insensitive and anything unrecognised falls back to slate.
 */

/** Suggested values for the composer's category field; free text is still allowed. */
export const TASK_CATEGORY_SUGGESTIONS = [
  'Personal',
  'Work',
  'Health',
  'Learning',
  'Errands',
  'Finance',
] as const;

const TONES: Record<string, string> = {
  personal: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  work: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  learning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  errands: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  finance: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

const FALLBACK_TONE = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

export function categoryToneClass(category: string | undefined): string {
  const key = (category ?? '').trim().toLowerCase();
  return TONES[key] ?? FALLBACK_TONE;
}

/** Where a task came from, phrased for a chip or a subtitle. */
export function createdFromLabel(createdFrom: string | undefined): string | null {
  switch (createdFrom) {
    case 'natural-language':
      return 'Added from a sentence';
    case 'voice':
      return 'Added from a voice note';
    case 'image':
      return 'Added from a scan';
    case 'manual':
      return 'Added by hand';
    default:
      return null;
  }
}
