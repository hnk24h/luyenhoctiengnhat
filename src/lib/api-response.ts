/**
 * api-response.ts
 * Standard response helpers for all API routes.
 *
 * Error shape: { error: { code, message }, message }
 *   - error.code    → machine-readable for mobile client
 *   - error.message → human-readable message
 *   - message       → top-level duplicate, kept for web backward compat
 *
 * Usage:
 *   return apiError('UNAUTHORIZED', 'Vui lòng đăng nhập.', 401);
 *   return apiOk(data);
 *   return apiOk(data, 201);
 */

import { NextResponse } from 'next/server';

// ── Error codes ─────────────────────────────────────────────────────────────
export const ApiCode = {
  UNAUTHORIZED:    'UNAUTHORIZED',
  FORBIDDEN:       'FORBIDDEN',
  NOT_FOUND:       'NOT_FOUND',
  BAD_REQUEST:     'BAD_REQUEST',
  INVALID_JSON:    'INVALID_JSON',
  CONFLICT:        'CONFLICT',
  VALIDATION:      'VALIDATION_ERROR',
  INTERNAL:        'INTERNAL_ERROR',
  RATE_LIMITED:    'RATE_LIMITED',
  GONE:            'GONE',
} as const;

export type ApiCodeType = typeof ApiCode[keyof typeof ApiCode];

// ── Error response ───────────────────────────────────────────────────────────
export function apiError(
  code: ApiCodeType | string,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json(
    {
      error: { code, message },
      message, // backward compat: web code using `data.message` still works
    },
    { status },
  );
}

// ── Success response ─────────────────────────────────────────────────────────
export function apiOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data as object, { status });
}
