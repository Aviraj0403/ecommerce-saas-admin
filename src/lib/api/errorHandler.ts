import { AxiosError } from 'axios';
import { toast } from '@/lib/toast';

export interface APIError {
  message: string;
  code?: string;
  field?: string;
  statusCode?: number;
  details?: any;
}

export function handleAPIError(error: unknown): APIError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const data = error.response?.data;

    // Handle specific status codes
    switch (statusCode) {
      case 400:
        return {
          message: data?.message || 'Invalid request. Please check your input.',
          code: data?.code || 'BAD_REQUEST',
          field: data?.field,
          statusCode,
          details: data?.details,
        };

      case 401:
        return {
          message: 'Your session has expired. Please log in again.',
          code: 'UNAUTHORIZED',
          statusCode,
        };

      case 403:
        return {
          message: data?.message || 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
          statusCode,
        };

      case 404:
        return {
          message: data?.message || 'The requested resource was not found.',
          code: 'NOT_FOUND',
          statusCode,
        };

      case 409:
        return {
          message: data?.message || 'This resource already exists or conflicts with existing data.',
          code: 'CONFLICT',
          statusCode,
        };

      case 422:
        return {
          message: data?.message || 'The provided data is invalid.',
          code: 'VALIDATION_ERROR',
          field: data?.field,
          statusCode,
          details: data?.details,
        };

      case 429:
        return {
          message: 'Too many requests. Please wait a moment before trying again.',
          code: 'RATE_LIMIT',
          statusCode,
        };

      case 500:
        return {
          message: 'Internal server error. Our team has been notified.',
          code: 'INTERNAL_SERVER_ERROR',
          statusCode,
        };

      case 502:
        return {
          message: 'Service temporarily unavailable. Please try again in a few minutes.',
          code: 'BAD_GATEWAY',
          statusCode,
        };

      case 503:
        return {
          message: 'Service is currently under maintenance. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
          statusCode,
        };

      case 504:
        return {
          message: 'Request timeout. Please try again.',
          code: 'GATEWAY_TIMEOUT',
          statusCode,
        };

      default:
        return {
          message: data?.message || 'An unexpected error occurred. Please try again.',
          code: data?.code || 'UNKNOWN_ERROR',
          statusCode,
          details: data?.details,
        };
    }
  }

  // Network errors
  if (error instanceof Error) {
    if (error.message === 'Network Error' || error.name === 'NetworkError') {
      return {
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    }

    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return {
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT_ERROR',
      };
    }
  }

  // Unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
  };
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleAPIError(error);
  return apiError.message;
}

export function displayAPIError(error: unknown): void {
  const apiError = handleAPIError(error);
  
  // Display appropriate toast based on error type
  switch (apiError.code) {
    case 'NETWORK_ERROR':
    case 'TIMEOUT_ERROR':
      toast.error(apiError.message, {
        description: 'Please check your connection and try again.',
        duration: 5000,
      });
      break;

    case 'UNAUTHORIZED':
      toast.error(apiError.message, {
        description: 'Redirecting to login page...',
        duration: 3000,
      });
      break;

    case 'FORBIDDEN':
      toast.error(apiError.message, {
        description: 'Contact support if you believe this is an error.',
        duration: 5000,
      });
      break;

    case 'VALIDATION_ERROR':
      toast.error(apiError.message, {
        description: apiError.field ? `Issue with field: ${apiError.field}` : undefined,
        duration: 4000,
      });
      break;

    case 'RATE_LIMIT':
      toast.warning(apiError.message, {
        description: 'Please wait before making more requests.',
        duration: 6000,
      });
      break;

    case 'INTERNAL_SERVER_ERROR':
    case 'BAD_GATEWAY':
    case 'SERVICE_UNAVAILABLE':
    case 'GATEWAY_TIMEOUT':
      toast.error(apiError.message, {
        description: 'If the problem persists, please contact support.',
        duration: 5000,
      });
      break;

    default:
      toast.error(apiError.message, {
        duration: 4000,
      });
  }
}

export function isRetryableError(error: unknown): boolean {
  const apiError = handleAPIError(error);
  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'INTERNAL_SERVER_ERROR',
    'BAD_GATEWAY',
    'SERVICE_UNAVAILABLE',
    'GATEWAY_TIMEOUT',
  ];
  
  return retryableCodes.includes(apiError.code || '');
}

export function handleServerError(error: unknown): void {
  const apiError = handleAPIError(error);
  
  if (apiError.statusCode && apiError.statusCode >= 500) {
    // Log detailed error information for debugging
    console.error('Server Error Details:', {
      status: apiError.statusCode,
      message: apiError.message,
      code: apiError.code,
      timestamp: new Date().toISOString(),
      error: error,
    });
    
    // Display error is already handled by displayAPIError
    // Just ensure we log it properly for monitoring
    
    // TODO: Send error to monitoring service (e.g., Sentry, LogRocket)
    // logErrorToService(error);
  }
}

export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt), 16000);
}
