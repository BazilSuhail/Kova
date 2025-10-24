import { Platform } from 'react-native';

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

export async function fileFormData(file: UploadFile, field = 'file'): Promise<FormData> {
  const form = new FormData();

  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    form.append(field, blob, file.name);
    return form;
  }

  form.append(field, { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  return form;
}

export function extensionFor(mimeType: string | undefined | null, fallback: string): string {
  if (!mimeType) return fallback;
  const known: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/heic': 'heic',
    'image/webp': 'webp',
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'application/pdf': 'pdf',
  };
  return known[mimeType.toLowerCase()] ?? fallback;
}
