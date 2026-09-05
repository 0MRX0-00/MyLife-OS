export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "RATE_LIMIT");
    this.name = "RateLimitError";
  }
}

export class IntegrationError extends AppError {
  constructor(
    provider: string,
    message: string,
    public originalError?: unknown
  ) {
    super(`${provider}: ${message}`, 502, "INTEGRATION_ERROR");
    this.name = "IntegrationError";
  }
}

/**
 * Standard API error response format.
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Standard API success response format.
 */
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

/**
 * Handle errors in API routes and return consistent responses.
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    const body: ApiErrorResponse = {
      error: {
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.errors
          ? { details: error.errors }
          : {}),
      },
    };
    return Response.json(body, { status: error.statusCode });
  }

  console.error("Unhandled error:", error);
  return Response.json(
    {
      error: {
        message: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      },
    } satisfies ApiErrorResponse,
    { status: 500 }
  );
}

/**
 * Handle errors in server actions and return user-friendly messages.
 */
export function handleActionError(error: unknown): {
  error: string;
  code: string;
} {
  if (error instanceof AppError) {
    return { error: error.message, code: error.code };
  }

  console.error("Unhandled action error:", error);
  return { error: "An unexpected error occurred", code: "INTERNAL_ERROR" };
}
