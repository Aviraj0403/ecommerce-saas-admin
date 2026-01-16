import { AxiosError } from 'axios';

export interface APIError {
  message: string;
  code?: string;
  field?: string;
  statusCode?: number;
}

export function handleAPIError(error: unknown): APIError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const data = error.response?.data;

    // Handle specific status codes
    switch (statusCode) {
      case 400:
        return {
          message: data?.message || 'Invalid request',
          code: data?.code || 'BAD_REQUEST',
          field: data?.field,
          statusCode,
        };

      case 401:
        return {
          message: 'Authentication required. Please log in.',
          code: 'UNAUTHORIZED',
          statusCode,
        };

      case 403:
        return {
          message: data?.message || 'Access denied',
          code: 'FORBIDDEN',
          statusCode,
        };

      case 404:
        return {
          message: data?.message || 'Resource not found',
          code: 'NOT_FOUND',
          statusCode,
        };

      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT',
          statusCode,
        };

      case 500:
      case 502:
      case 503:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          statusCode,
        };

      default:
        return {
          message: data?.message || 'An error occurred',
          code: data?.code || 'UNKNOWN_ERROR',
          statusCode,
        };
    }
  }

  // Network errors
  if (error instanceof Error && error.message === 'Network Error') {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }

  // Unknown errors
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleAPIError(error);
  return apiError.message;
}
