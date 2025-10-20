import { z } from 'zod';

import { request } from './client';
import { deviceSchema, parseOrThrow, type Device } from './types';

export type DevicePlatform = 'ios' | 'android' | 'web';

const deviceListSchema = z.array(deviceSchema);

/** `GET /api/devices/` — the caller's registered devices, newest first. */
export async function listDevices(): Promise<Device[]> {
  const payload = await request<unknown>('/api/devices/');
  return parseOrThrow(deviceListSchema, payload, 'devices');
}

/**
 * `POST /api/devices/` — one row per physical device.
 *
 * Registering a token that already exists **re-owns** the row, so calling this on every
 * app start is safe and keeps the token attached to whoever is signed in.
 */
export async function registerDevice(input: {
  expoPushToken: string;
  platform: DevicePlatform;
}): Promise<Device> {
  const payload = await request<unknown>('/api/devices/', { method: 'POST', body: input });
  return parseOrThrow(deviceSchema, payload, 'device');
}

/** `DELETE /api/devices/<deviceId>` */
export async function unregisterDevice(deviceId: string): Promise<void> {
  await request<unknown>(`/api/devices/${deviceId}`, { method: 'DELETE' });
}
