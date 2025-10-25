export const TASK_CATEGORY_SUGGESTIONS = [
  'Personal',
  'Work',
  'Health',
  'Learning',
  'Errands',
  'Finance',
] as const;

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
