"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrors = exports.createApiError = exports.handleError = exports.ApiException = void 0;
const server_1 = require("next/server");
class ApiException extends Error {
    constructor(error) {
        super(error.message);
        this.error = error;
        this.name = 'ApiException';
    }
}
exports.ApiException = ApiException;
function handleError(error) {
    console.error('API Error:', error);
    // Handle known error types
    if (error instanceof ApiException) {
        return server_1.NextResponse.json({ error: error.error }, { status: error.error.status });
    }
    // Handle Supabase errors
    if (isSupabaseError(error)) {
        return server_1.NextResponse.json({
            error: {
                message: error.message,
                code: error.code,
                status: 400,
                details: error.details,
            },
        }, { status: 400 });
    }
    // Handle validation errors
    if (isValidationError(error)) {
        return server_1.NextResponse.json({
            error: {
                message: 'Validation error',
                code: 'VALIDATION_ERROR',
                status: 400,
                details: error.errors,
            },
        }, { status: 400 });
    }
    // Handle unknown errors
    return server_1.NextResponse.json({
        error: {
            message: 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR',
            status: 500,
        },
    }, { status: 500 });
}
exports.handleError = handleError;
function createApiError(message, code, status = 400, details) {
    return {
        message,
        code,
        status,
        details,
    };
}
exports.createApiError = createApiError;
// Type guards
function isSupabaseError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'code' in error);
}
function isValidationError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'errors' in error &&
        Array.isArray(error.errors));
}
// Common error factories
exports.ApiErrors = {
    NotFound: (resource) => new ApiException({
        message: `${resource} not found`,
        code: 'NOT_FOUND',
        status: 404,
    }),
    Unauthorized: () => new ApiException({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        status: 401,
    }),
    Forbidden: () => new ApiException({
        message: 'Forbidden',
        code: 'FORBIDDEN',
        status: 403,
    }),
    BadRequest: (message, details) => new ApiException({
        message,
        code: 'BAD_REQUEST',
        status: 400,
        details,
    }),
    ValidationError: (errors) => new ApiException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: errors,
    }),
};
