import { request, unwrapList, type Paginated } from './client';
import {
  listSchema,
  parseOrThrow,
  summaryCreateSchema,
  summarySchema,
  taskSchema,
  type Summary,
  type SummaryCreate,
  type Task,
} from './types';
import { fileFormData, type UploadFile } from '@/lib/upload';

export type SummaryFilters = {
  page?: number;
  limit?: number;
};

const summaryListSchema = listSchema(summarySchema);

/** Reading a PDF and summarising it takes longer than a plain fetch. */
const UPLOAD_TIMEOUT_MS = 120_000;

/** `GET /api/summaries/` — the library. There is no single-GET, so detail renders from this. */
export async function listSummaries(filters: SummaryFilters = {}): Promise<Paginated<Summary>> {
  const payload = await request<unknown>('/api/summaries/', { query: { ...filters } });
  return unwrapList(parseOrThrow(summaryListSchema, payload, 'summaries'));
}

/** `POST /api/summaries/create-from-text` — notes or a transcript in, 3–5 bullets out. */
export async function createSummaryFromText(input: {
  text: string;
  title?: string;
}): Promise<SummaryCreate> {
  const payload = await request<unknown>('/api/summaries/create-from-text', {
    method: 'POST',
    body: input,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
  return parseOrThrow(summaryCreateSchema, payload, 'summary');
}

/** `POST /api/summaries/create` — multipart PDF upload. */
export async function createSummaryFromPdf(file: UploadFile): Promise<SummaryCreate> {
  const payload = await request<unknown>('/api/summaries/create', {
    method: 'POST',
    form: await fileFormData(file),
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
  return parseOrThrow(summaryCreateSchema, payload, 'summary');
}

/** `POST /api/summaries/<id>/convert-to-tasks` — persists the suggested task. */
export async function convertSummaryToTask(summaryId: string): Promise<Task> {
  const payload = await request<unknown>(`/api/summaries/${summaryId}/convert-to-tasks`, {
    method: 'POST',
  });
  return parseOrThrow(taskSchema, payload, 'task');
}

/** `PUT /api/summaries/<id>` — bullet edits and renames. */
export async function updateSummary(summaryId: string, summaryBullets: string[]): Promise<void> {
  await request<unknown>(`/api/summaries/${summaryId}`, {
    method: 'PUT',
    body: { summaryBullets },
  });
}

/** `DELETE /api/summaries/<id>` */
export async function deleteSummary(summaryId: string): Promise<void> {
  await request<unknown>(`/api/summaries/${summaryId}`, { method: 'DELETE' });
}
