import { randomUUID } from 'crypto';

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}

export function apiSuccess<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId ?? randomUUID(),
    },
  };
}

export function apiError<T = null>(
  code: string,
  message: string,
  requestId?: string
): ApiResponse<T> {
  return {
    data: null,
    error: { code, message },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId ?? randomUUID(),
    },
  };
}
