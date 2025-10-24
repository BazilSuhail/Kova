export const TASK_CATEGORY_SUGGESTIONS = [
  'Personal',
  'Work',
  'Health',
  'Learning',
  'Errands',
  'Finance',
] as const;

type Tone = { surface: string; ink: string };

const TONES: Record<string, Tone> = {
  personal: { surface: 'bg-surface-alt', ink: 'text-heading' },
  work: { surface: 'bg-brand', ink: 'text-on-brand' },
  health: { surface: 'bg-accent', ink: 'text-on-accent' },
  learning: { surface: 'bg-surface-alt', ink: 'text-heading' },
  errands: { surface: 'bg-surface-alt', ink: 'text-heading' },
  finance: { surface: 'bg-brand', ink: 'text-on-brand' },
};

const FALLBACK_TONE: Tone = { surface: 'border border-border bg-surface', ink: 'text-body' };

function toneFor(category: string | undefined): Tone {
  const key = (category ?? '').trim().toLowerCase();
  return TONES[key] ?? FALLBACK_TONE;
}

export function categoryToneClass(category: string | undefined): string {
  return toneFor(category).surface;
}

export function categoryInkClass(category: string | undefined): string {
  return toneFor(category).ink;
}

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
