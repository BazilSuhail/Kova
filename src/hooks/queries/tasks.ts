import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';

import type { Paginated } from '@/api/client';
import { deleteSubtask, generateSubtasks, listSubtasks, updateSubtask } from '@/api/subtasks';
import {
  categorizeTask,
  createTask,
  createTaskFromImage,
  createTaskFromPrompt,
  createTaskFromVoice,
  deleteTask,
  fetchTask,
  listTasks,
  rewriteTaskTitle,
  suggestTitle,
  updateTask,
  type CreateTaskInput,
  type TaskFilters,
  type UpdateTaskInput,
} from '@/api/tasks';
import type { SubtaskGroup, Task } from '@/api/types';
import { isNotFound } from '@/lib/errors';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import type { UploadFile } from '@/lib/upload';
import { queryKeys } from './keys';

/** Only the filters a screen controls; paging is the hook's business. */
export type TaskQuery = Omit<TaskFilters, 'page' | 'limit'>;

const PAGE_SIZE = 20;

type TaskListData = InfiniteData<Paginated<Task>>;

/**
 * Anything that writes to a task also moves the home summary, so every mutation here
 * refreshes both. Listing writes through `taskLists` keeps optimistic patches narrow.
 */
function useTaskRefresher() {
  const client = useQueryClient();

  return (taskId?: string) => {
    void client.invalidateQueries({ queryKey: queryKeys.tasks });
    void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    void client.invalidateQueries({ queryKey: queryKeys.dailyRecap });
    if (taskId) void client.invalidateQueries({ queryKey: queryKeys.subtasks(taskId) });
  };
}

/** Applies a change to one task everywhere it is already cached. */
function patchCachedTask(
  client: QueryClient,
  taskId: string,
  transform: (task: Task) => Task,
): void {
  client.setQueriesData<TaskListData>({ queryKey: queryKeys.taskLists }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((task) => (task.taskId === taskId ? transform(task) : task)),
          })),
        }
      : data,
  );
}

/** `GET /api/tasks/` — infinite pages, newest filters swap in place. */
export function useTasks(filters: TaskQuery) {
  return useInfiniteQuery({
    queryKey: queryKeys.taskList(filters),
    queryFn: ({ pageParam }) => listTasks({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 1) + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

/** `GET /api/tasks/<taskId>` — the detail screen's own copy of the task. */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.task(taskId),
    queryFn: () => fetchTask(taskId),
    enabled: Boolean(taskId),
  });
}

/**
 * The categories the user actually has.
 *
 * Categories are free text on the server and there is no listing route, so the filter row is
 * derived from one broad page. Five minutes of staleness is plenty for a filter chip, and any
 * task write invalidates the `tasks` prefix anyway.
 */
export function useTaskCategories() {
  return useQuery({
    queryKey: queryKeys.taskCategories,
    queryFn: async (): Promise<string[]> => {
      const page = await listTasks({ limit: 100 });
      const found = new Set<string>();
      for (const task of page.items) {
        if (task.category) found.add(task.category);
      }
      return Array.from(found).sort();
    },
    staleTime: 5 * 60_000,
  });
}

export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: queryKeys.subtasks(taskId),
    queryFn: () => listSubtasks(taskId),
    enabled: Boolean(taskId),
  });
}

export function useCreateTask() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: (task) => {
      successFeedback();
      refresh(task.taskId);
    },
  });
}

/** Natural language capture: one sentence in, a filed task out. */
export function useCaptureTask() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (prompt: string) => createTaskFromPrompt(prompt),
    onSuccess: (task) => {
      successFeedback();
      refresh(task.taskId);
    },
  });
}

/** Voice capture: the server transcribes the clip, then files the task. */
export function useCaptureTaskFromVoice() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (file: UploadFile) => createTaskFromVoice(file),
    onSuccess: (task) => {
      successFeedback();
      refresh(task.taskId);
    },
  });
}

/** Photo capture: OCR reads the page first, then the task is filed. */
export function useCaptureTaskFromImage() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (file: UploadFile) => createTaskFromImage(file),
    onSuccess: ({ task }) => {
      successFeedback();
      refresh(task.taskId);
    },
  });
}

/**
 * Completion toggle with an optimistic patch, because the row should react to the tap
 * immediately rather than after a round trip.
 */
export function useToggleTask() {
  const client = useQueryClient();
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) =>
      updateTask(taskId, { isCompleted }),

    // Ticking something off is the one action that deserves a pulse of its own.
    onSuccess: (_data, { isCompleted }) => {
      if (isCompleted) successFeedback();
    },

    onMutate: async ({ taskId, isCompleted }) => {
      await client.cancelQueries({ queryKey: queryKeys.tasks });
      const lists = client.getQueriesData<TaskListData>({ queryKey: queryKeys.taskLists });
      const detail = client.getQueryData<Task>(queryKeys.task(taskId));

      patchCachedTask(client, taskId, (task) => ({ ...task, isCompleted }));
      if (detail) client.setQueryData<Task>(queryKeys.task(taskId), { ...detail, isCompleted });

      return { lists, detail };
    },

    onError: (error, { taskId }, context) => {
      // ⚠️ `PUT` answers 404 when no field actually changed, so a notFound here means the
      // server already agrees with the new value. Keep it and let the refetch confirm.
      if (isNotFound(error)) return;

      context?.lists.forEach(([key, data]) => client.setQueryData(key, data));
      if (context?.detail) client.setQueryData(queryKeys.task(taskId), context.detail);
    },

    onSettled: (_data, _error, { taskId }) => refresh(taskId),
  });
}

/** Field edits from the detail screen. */
export function useUpdateTask() {
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      updateTask(taskId, input),
    onSuccess: (_data, { taskId }) => refresh(taskId),
    onError: (error, { taskId }) => {
      // The documented no-op 404 still leaves the task in the requested state.
      if (isNotFound(error)) refresh(taskId);
    },
  });
}

export function useDeleteTask() {
  const client = useQueryClient();
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),

    onMutate: async (taskId) => {
      await client.cancelQueries({ queryKey: queryKeys.tasks });
      const lists = client.getQueriesData<TaskListData>({ queryKey: queryKeys.taskLists });
      const detail = client.getQueryData<Task>(queryKeys.task(taskId));

      client.setQueriesData<TaskListData>({ queryKey: queryKeys.taskLists }, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.filter((task) => task.taskId !== taskId),
                total: Math.max(0, page.total - 1),
              })),
            }
          : data,
      );
      client.removeQueries({ queryKey: queryKeys.task(taskId) });

      return { lists, detail };
    },

    onError: (_error, taskId, context) => {
      context?.lists.forEach(([key, data]) => client.setQueryData(key, data));
      if (context?.detail) client.setQueryData(queryKeys.task(taskId), context.detail);
    },

    onSettled: (_data, _error, taskId) => {
      warnFeedback();
      refresh(taskId);
    },
  });
}

/** Re-derives the category server side and stores it. */
export function useCategorizeTask() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (taskId: string) => categorizeTask(taskId),
    onSuccess: (_category, taskId) => refresh(taskId),
  });
}

/** Rewrites the stored title. */
export function useRewriteTaskTitle() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (taskId: string) => rewriteTaskTitle(taskId),
    onSuccess: (_title, taskId) => refresh(taskId),
  });
}

/** Preview-only title rewrite used by the composer's "Improve" action. */
export function useSuggestTitle() {
  return useMutation({
    mutationFn: (title: string) => suggestTitle(title),
  });
}

/** Asks the model to split the task's description into 3–8 steps. */
export function useGenerateSubtasks(taskId: string) {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (title?: string) => generateSubtasks(taskId, title),
    onSuccess: () => refresh(taskId),
  });
}

export function useToggleSubtask(taskId: string) {
  const client = useQueryClient();
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: ({ subtaskId, done }: { subtaskId: string; done: boolean }) =>
      updateSubtask(subtaskId, { done }),

    onMutate: async ({ subtaskId, done }) => {
      await client.cancelQueries({ queryKey: queryKeys.subtasks(taskId) });
      const snapshot = client.getQueryData<SubtaskGroup[]>(queryKeys.subtasks(taskId));

      client.setQueryData<SubtaskGroup[]>(queryKeys.subtasks(taskId), (current) =>
        current
          ? current.map((group) => (group.subtaskId === subtaskId ? { ...group, done } : group))
          : current,
      );

      return { snapshot };
    },

    onError: (_error, _variables, context) => {
      if (context?.snapshot) client.setQueryData(queryKeys.subtasks(taskId), context.snapshot);
    },

    onSettled: () => refresh(taskId),
  });
}

export function useDeleteSubtask(taskId: string) {
  const client = useQueryClient();
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: (subtaskId: string) => deleteSubtask(subtaskId),

    onMutate: async (subtaskId) => {
      await client.cancelQueries({ queryKey: queryKeys.subtasks(taskId) });
      const snapshot = client.getQueryData<SubtaskGroup[]>(queryKeys.subtasks(taskId));

      client.setQueryData<SubtaskGroup[]>(queryKeys.subtasks(taskId), (current) =>
        current ? current.filter((group) => group.subtaskId !== subtaskId) : current,
      );

      return { snapshot };
    },

    onError: (_error, _subtaskId, context) => {
      if (context?.snapshot) client.setQueryData(queryKeys.subtasks(taskId), context.snapshot);
    },

    onSettled: () => refresh(taskId),
  });
}
