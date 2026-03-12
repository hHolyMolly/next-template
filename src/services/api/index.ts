import API_PATHS from '@/services/api/paths';

import API, { request, isApiError, isAbortError } from '@/services/api/instance';
import { fetcher, isFetcherError } from '@/services/api/fetcher';

export { API_PATHS, API, request, isApiError, isAbortError, fetcher, isFetcherError };
