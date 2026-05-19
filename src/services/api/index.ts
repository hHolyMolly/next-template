import API, { request, isApiError, isAbortError } from '@/services/api/instance';
import API_PATHS from '@/services/api/paths';
import { serverFetch, ServerFetchError } from '@/services/api/serverFetch';

export { API_PATHS, API, request, isApiError, isAbortError, serverFetch, ServerFetchError };

export {
  todoKeys,
  useTodos,
  useTodo,
  useCreateTodo,
  type Todo,
  type CreateTodoInput,
} from '@/services/api/queries';
