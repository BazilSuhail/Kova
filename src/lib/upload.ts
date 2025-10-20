import { Platform } from 'react-native';

export type UploadFile = {
  /** Local `file://` (native) or `blob:` / `data:` (web) URI from the picker. */
  uri: string;
  name: string;
  /** MIME type, e.g. `image/jpeg`, `audio/m4a`, `application/pdf`. */
  type: string;
};

/**
 * Builds a `multipart/form-data` body for one file.
 *
 * Native accepts React Native's `{ uri, name, type }` descriptor directly. The web build
 * needs a real `Blob`, so the URI is fetched first — which also covers the picker's
 * `blob:` URLs. The client leaves `Content-Type` unset so fetch can supply the boundary.
 */
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

/** Best-effort file extension from a MIME type, used when the picker sends no name. */
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
