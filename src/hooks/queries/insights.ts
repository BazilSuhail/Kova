import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteMoodEntry,
  fetchMoodEntry,
  fetchMoodLoad,
  fetchMoodTrends,
  listMoodEntries,
  logMood,
  type LogMoodInput,
  type MoodFilters,
} from '@/api/mood';
import { fetchProgress } from '@/api/progress';
import {
  deleteReflection,
  fetchReflection,
  fetchTodayReflection,
  listReflections,
  writeReflection,
  type WriteReflectionInput,
} from '@/api/reflections';
import {
  convertSummaryToTask,
  createSummaryFromPdf,
  createSummaryFromText,
  deleteSummary,
  listSummaries,
  updateSummary,
  type SummaryFilters,
} from '@/api/summaries';
import { fetchSuggestions } from '@/api/suggestions';
import type { Summary } from '@/api/types';
import type { UploadFile } from '@/lib/upload';
import { queryKeys } from './keys';

const PAGE_SIZE = 20;

/** `GET /api/progress/` — derived on read, so a short stale window is plenty. */
export function useProgress() {
  return useQuery({
    queryKey: queryKeys.progress,
    queryFn: fetchProgress,
    staleTime: 30_000,
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: queryKeys.suggestions,
    queryFn: fetchSuggestions,
    staleTime: 30_000,
  });
}

/* ── Mood ── */

export function useMoodEntries(filters: MoodFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.moodList(filters),
    queryFn: ({ pageParam }) => listMoodEntries({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 1) + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useMoodEntry(moodId: string) {
  return useQuery({
    queryKey: queryKeys.moodEntry(moodId),
    queryFn: () => fetchMoodEntry(moodId),
    enabled: Boolean(moodId),
  });
}

export function useMoodTrends(days = 30) {
  return useQuery({
    queryKey: queryKeys.moodTrends(days),
    queryFn: () => fetchMoodTrends(days),
  });
}

/**
 * How much to take on today. With no input the server reads the latest logged mood, so the
 * check-in screen has guidance before anything is picked.
 */
export function useMoodLoad(input: { mood?: string; energy?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.moodLoad(input.mood, input.energy),
    queryFn: () => fetchMoodLoad(input),
    staleTime: 60_000,
  });
}

export function useLogMood() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: LogMoodInput) => logMood(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.mood });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
      void client.invalidateQueries({ queryKey: queryKeys.progress });
      void client.invalidateQueries({ queryKey: queryKeys.suggestions });
    },
  });
}

export function useDeleteMoodEntry() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (moodId: string) => deleteMoodEntry(moodId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.mood });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
      void client.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}

/* ── Journal ── */

export function useTodayReflection(date?: string) {
  return useQuery({
    queryKey: queryKeys.todayReflection(date),
    queryFn: () => fetchTodayReflection(date),
  });
}

export function useReflections() {
  return useQuery({
    queryKey: queryKeys.reflections,
    queryFn: listReflections,
  });
}

export function useReflection(reflectionId: string) {
  return useQuery({
    queryKey: queryKeys.reflection(reflectionId),
    queryFn: () => fetchReflection(reflectionId),
    enabled: Boolean(reflectionId),
  });
}

export function useWriteReflection(date?: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: WriteReflectionInput) => writeReflection(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.reflections });
      void client.invalidateQueries({ queryKey: queryKeys.todayReflection(date) });
      void client.invalidateQueries({ queryKey: queryKeys.recaps });
      void client.invalidateQueries({ queryKey: queryKeys.progress });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteReflection() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (reflectionId: string) => deleteReflection(reflectionId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.reflections });
      void client.invalidateQueries({ queryKey: queryKeys.recaps });
      void client.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}

/* ── Library ── */

export function useSummaries(filters: SummaryFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.summaryList(filters),
    queryFn: ({ pageParam }) => listSummaries({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 1) + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

/**
 * There is no single-GET for a summary, so the detail screen reads the shared list cache
 * and refetches the first page when the id is not in it yet (a deep link, for example).
 */
export function useSummary(summaryId: string): {
  summary: Summary | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
} {
  const query = useSummaries();
  const summary =
    query.data?.pages.flatMap((page) => page.items).find((item) => item.summaryId === summaryId) ??
    null;

  return {
    summary,
    isLoading: query.isPending || (query.isFetching && !summary),
    isError: query.isError && !summary,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}

export function useCreateSummaryFromText() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { text: string; title?: string }) => createSummaryFromText(input),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.summaries }),
  });
}

export function useCreateSummaryFromPdf() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (file: UploadFile) => createSummaryFromPdf(file),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.summaries }),
  });
}

export function useConvertSummaryToTask() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (summaryId: string) => convertSummaryToTask(summaryId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.tasks });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateSummary() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ summaryId, bullets }: { summaryId: string; bullets: string[] }) =>
      updateSummary(summaryId, bullets),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.summaries }),
  });
}

export function useDeleteSummary() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (summaryId: string) => deleteSummary(summaryId),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.summaries }),
  });
}
