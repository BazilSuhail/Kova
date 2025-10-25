import { Platform } from 'react-native';

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', uri);
    xhr.responseType = 'blob';
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Failed to read file: HTTP ${xhr.status}`));
        }
      }
    };
    xhr.onerror = () => reject(new Error(`Failed to read file at ${uri}`));
    xhr.send();
  });
}

export async function fileFormData(file: UploadFile, field = 'file'): Promise<FormData> {
  const form = new FormData();

  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    form.append(field, blob, file.name);
    return form;
  }

  const blob = await uriToBlob(file.uri);
  form.append(field, blob, file.name);
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
