import { NextResponse } from 'next/server';
import { PostgrestError } from '@supabase/supabase-js';

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: unknown;
}

export class ApiException extends Error {
  constructor(
    public error: ApiError
  ) {
    super(error.message);
    this.name = 'ApiException';
  }
}

export function handleError(error: unknown) {
  console.error('API Error:', error);

  // Handle known error types
  if (error instanceof ApiException) {
    return NextResponse.json(
      { error: error.error },
      { status: error.error.status }
    );
  }

  // Handle Supabase errors
  if (isSupabaseError(error)) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          status: 400,
          details: error.details,
        },
      },
      { status: 400 }
    );
  }

  // Handle validation errors
  if (isValidationError(error)) {
    return NextResponse.json(
      {
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          status: 400,
          details: error.errors,
        },
      },
      { status: 400 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
      },
    },
    { status: 500 }
  );
}

export function createApiError(
  message: string,
  code: string,
  status: number = 400,
  details?: unknown
): ApiError {
  return {
    message,
    code,
    status,
    details,
  };
}

// Type guards
function isSupabaseError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
}

interface ValidationError {
  errors: Array<{ message: string; path: string[] }>;
}

function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as ValidationError).errors)
  );
}

// Common error factories
export const ApiErrors = {
  NotFound: (resource: string) =>
    new ApiException({
      message: `${resource} not found`,
      code: 'NOT_FOUND',
      status: 404,
    }),

  Unauthorized: () =>
    new ApiException({
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
      status: 401,
    }),

  Forbidden: () =>
    new ApiException({
      message: 'Forbidden',
      code: 'FORBIDDEN',
      status: 403,
    }),

  BadRequest: (message: string, details?: unknown) =>
    new ApiException({
      message,
      code: 'BAD_REQUEST',
      status: 400,
      details,
    }),

  ValidationError: (errors: Array<{ message: string; path: string[] }>) =>
    new ApiException({
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      status: 400,
      details: errors,
    }),
}; 