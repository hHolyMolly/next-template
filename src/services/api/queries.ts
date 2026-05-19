/**
 * TanStack Query hooks for the example `todos` resource.
 *
 * This file is the canonical example for adding a new API resource:
 *   1. Add the endpoint to `@/services/api/paths`.
 *   2. Add the DTO type below.
 *   3. Add a query-key factory (`todoKeys`) — keeps invalidations exhaustive.
 *   4. Wrap the request in a typed `useQuery` / `useMutation`.
 *
 * All API I/O in the app should go through TanStack Query — never call
 * `request()` directly from a component. That guarantees a single cache,
 * automatic deduplication, devtools insight, and consistent loading states.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { request } from '@/services/api/instance';
import API_PATHS from '@/services/api/paths';

import type { AxiosError } from 'axios';

// ---------- DTO ----------------------------------------------------------------

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type CreateTodoInput = {
  title: string;
};

// ---------- Query keys ---------------------------------------------------------

/**
 * Hierarchical key factory. Always invalidate via the broadest key that still
 * makes sense (`todoKeys.all` after a mutation, `todoKeys.detail(id)` after
 * a single-item edit).
 */
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters?: Readonly<Record<string, unknown>>) =>
    [...todoKeys.lists(), filters ?? {}] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...todoKeys.details(), id] as const,
};

// ---------- Queries ------------------------------------------------------------

export function useTodos(
  options?: Omit<UseQueryOptions<Todo[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Todo[], AxiosError>({
    queryKey: todoKeys.list(),
    queryFn: ({ signal }) => request<Todo[]>({ url: API_PATHS.todos, method: 'GET' }, signal),
    ...options,
  });
}

export function useTodo(
  id: string | number,
  options?: Omit<UseQueryOptions<Todo, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Todo, AxiosError>({
    queryKey: todoKeys.detail(id),
    queryFn: ({ signal }) => request<Todo>({ url: API_PATHS.todo(id), method: 'GET' }, signal),
    ...options,
  });
}

// ---------- Mutations ----------------------------------------------------------

export function useCreateTodo(options?: UseMutationOptions<Todo, AxiosError, CreateTodoInput>) {
  const queryClient = useQueryClient();
  return useMutation<Todo, AxiosError, CreateTodoInput>({
    mutationFn: (input) => request<Todo>({ url: API_PATHS.todos, method: 'POST', data: input }),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
