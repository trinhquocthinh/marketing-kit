import 'server-only';

import { cookies } from 'next/headers';

import { API_BASE_URL } from './api.config';

/**
 * Server-side HTTP wrapper cho React Server Components.
 *
 * - Dùng `fetch` native của Next.js → tận dụng cache (`force-cache`, `revalidate`, `tags`).
 * - Đọc cookie `auth_token` qua `next/headers` để gắn `Authorization`.
 * - Shape response đồng nhất với `HttpResult<T>` của Axios service bên client.
 *
 * KHÔNG dùng file này trong Client Components (`"use client"`); sẽ throw ở build.
 */

export interface ServerHttpResult<T> {
  isSuccess: boolean;
  status: number;
  data: T;
  error?: string;
  errorCode?: 'ApiError' | 'NoResponse' | 'RequestError';
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const PUBLIC_ENDPOINTS = ['/agents/login', '/agents/register'];

interface ServerFetchOptions {
  /** Auto-attach Bearer token từ cookie. Mặc định `true`. */
  auth?: boolean;
  /** Cache strategy — mapping của `next.cache`. */
  cache?: RequestCache;
  /** Số giây revalidate (ISR). Set `0` để luôn fresh. */
  revalidate?: number | false;
  /** Cache tags để dùng với `revalidateTag()`. */
  tags?: string[];
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface ServerFetchRequest<TBody> extends ServerFetchOptions {
  method?: HttpMethod;
  body?: TBody;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get('auth_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<TBody, TResponse>(
  path: string,
  {
    method = 'GET',
    body,
    auth = true,
    cache,
    revalidate,
    tags,
    headers,
    signal,
  }: ServerFetchRequest<TBody> = {},
): Promise<ServerHttpResult<TResponse>> {
  const isPublic = PUBLIC_ENDPOINTS.some((ep) => path.includes(ep));
  const authHeader = auth && !isPublic ? await getAuthHeader() : {};

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  // Next.js tuỳ chọn revalidate/tags nằm trong `next` key.
  // Khi set `tags`, KHÔNG được set `cache: 'no-store'`.
  const nextOptions: { revalidate?: number | false; tags?: string[] } = {};
  if (revalidate !== undefined) nextOptions.revalidate = revalidate;
  if (tags?.length) nextOptions.tags = tags;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...(cache ? { cache } : {}),
      ...(Object.keys(nextOptions).length ? { next: nextOptions } : {}),
      signal,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : ((await response.text()) as unknown);

    if (!response.ok) {
      return {
        isSuccess: false,
        status: response.status,
        data: payload as TResponse,
        error:
          (typeof payload === 'object' && payload && 'message' in payload
            ? String((payload as { message?: unknown }).message)
            : undefined) ?? response.statusText,
        errorCode: 'ApiError',
      };
    }

    return {
      isSuccess: true,
      status: response.status,
      data: payload as TResponse,
    };
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    return {
      isSuccess: false,
      status: 0,
      data: null as unknown as TResponse,
      error: err instanceof Error ? err.message : 'Unknown error',
      errorCode: isAbort ? 'NoResponse' : 'RequestError',
    };
  }
}

/** GET với cache mặc định. Set `revalidate` hoặc `tags` để bật ISR. */
export function serverGet<T>(path: string, options: ServerFetchOptions = {}) {
  return request<never, T>(path, { ...options, method: 'GET' });
}

/** POST — mặc định `cache: 'no-store'` vì mutation. */
export function serverPost<TBody, TResponse>(
  path: string,
  body: TBody,
  options: ServerFetchOptions = {},
) {
  return request<TBody, TResponse>(path, {
    cache: 'no-store',
    ...options,
    method: 'POST',
    body,
  });
}

export function serverPut<TBody, TResponse>(
  path: string,
  body: TBody,
  options: ServerFetchOptions = {},
) {
  return request<TBody, TResponse>(path, {
    cache: 'no-store',
    ...options,
    method: 'PUT',
    body,
  });
}

export function serverDelete<T>(path: string, options: ServerFetchOptions = {}) {
  return request<never, T>(path, {
    cache: 'no-store',
    ...options,
    method: 'DELETE',
  });
}

/** Cache tags chuẩn hoá cho revalidateTag. */
export const CacheTags = {
  folders: 'folders',
  performance: 'performance',
  alias: 'alias',
  avatar: 'avatar',
} as const;
