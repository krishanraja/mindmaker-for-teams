/**
 * Standardized API Response Types
 * 
 * All async functions that interact with APIs, databases, or external services
 * should return one of these standardized response types.
 */

/**
 * Standard API response wrapper
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  fallbackUsed?: boolean;
}

/**
 * Paginated API response
 * @template T - The type of items in the list
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Create a successful response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error response
 */
export function errorResponse<T = never>(
  error: string,
  errorCode?: string
): ApiResponse<T> {
  return {
    success: false,
    error,
    errorCode,
  };
}

/**
 * Create a fallback response (success with fallback flag)
 */
export function fallbackResponse<T>(
  data: T,
  originalError?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    fallbackUsed: true,
    error: originalError,
  };
}

/**
 * Wrap an async operation with standardized error handling
 */
export async function withApiResponse<T>(
  operation: () => Promise<T>,
  errorMessage = 'Operation failed'
): Promise<ApiResponse<T>> {
  try {
    const data = await operation();
    return successResponse(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : errorMessage;
    console.error(`[API Error] ${errorMessage}:`, err);
    return errorResponse(message);
  }
}

/**
 * Type guard to check if response is successful
 */
export function isSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

/**
 * Type guard to check if response is an error
 */
export function isError<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { error: string } {
  return !response.success && response.error !== undefined;
}
