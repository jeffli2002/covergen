/**
 * Core error classes for the shared modules system
 */

// Base error class
export abstract class BaseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly metadata?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.metadata = metadata;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
      stack: this.stack
    };
  }
}

// Authentication errors
export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed', metadata?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, metadata);
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(metadata?: Record<string, any>) {
    super('Invalid email or password', metadata);
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(tokenType: 'access' | 'refresh' = 'access') {
    super(`${tokenType} token has expired`, { tokenType });
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(reason?: string) {
    super('Invalid token', { reason });
  }
}

export class MFARequiredError extends AuthenticationError {
  constructor(methods: string[]) {
    super('Multi-factor authentication required', { methods });
  }
}

// Authorization errors
export class AuthorizationError extends BaseError {
  constructor(message: string = 'Access denied', metadata?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, metadata);
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(requiredPermissions: string[], userPermissions: string[]) {
    super('Insufficient permissions', { requiredPermissions, userPermissions });
  }
}

export class RateLimitError extends BaseError {
  constructor(limit: number, window: number, resetAt: Date) {
    super(
      `Rate limit exceeded. Limited to ${limit} requests per ${window}ms`,
      'RATE_LIMIT_ERROR',
      429,
      true,
      { limit, window, resetAt }
    );
  }
}

// Validation errors
export class ValidationError extends BaseError {
  constructor(message: string, errors: ValidationErrorItem[]) {
    super(message, 'VALIDATION_ERROR', 400, true, { errors });
  }
}

export interface ValidationErrorItem {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}

// Resource errors
export class NotFoundError extends BaseError {
  constructor(resource: string, id?: string) {
    super(
      `${resource} not found${id ? `: ${id}` : ''}`,
      'NOT_FOUND',
      404,
      true,
      { resource, id }
    );
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 'CONFLICT', 409, true, metadata);
  }
}

export class DuplicateResourceError extends ConflictError {
  constructor(resource: string, field: string, value: any) {
    super(`${resource} with ${field} '${value}' already exists`, { resource, field, value });
  }
}

// Business logic errors
export class BusinessLogicError extends BaseError {
  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR', metadata?: Record<string, any>) {
    super(message, code, 400, true, metadata);
  }
}

export class QuotaExceededError extends BusinessLogicError {
  constructor(resource: string, limit: number, used: number) {
    super(
      `Quota exceeded for ${resource}. Limit: ${limit}, Used: ${used}`,
      'QUOTA_EXCEEDED',
      { resource, limit, used }
    );
  }
}

export class SubscriptionRequiredError extends BusinessLogicError {
  constructor(feature: string, requiredPlan?: string) {
    super(
      `This feature requires a subscription${requiredPlan ? ` (${requiredPlan} or higher)` : ''}`,
      'SUBSCRIPTION_REQUIRED',
      { feature, requiredPlan }
    );
  }
}

export class PaymentRequiredError extends BusinessLogicError {
  constructor(reason: string, amount?: number, currency?: string) {
    super(reason, 'PAYMENT_REQUIRED', { amount, currency });
  }
}

// External service errors
export class ExternalServiceError extends BaseError {
  constructor(
    service: string,
    message: string,
    originalError?: Error,
    isRetryable: boolean = true
  ) {
    super(
      message,
      'EXTERNAL_SERVICE_ERROR',
      502,
      true,
      { service, originalError: originalError?.message, isRetryable }
    );
  }
}

export class PaymentProviderError extends ExternalServiceError {
  constructor(provider: string, message: string, providerCode?: string, isRetryable: boolean = false) {
    super(provider, message, undefined, isRetryable);
    this.metadata!.providerCode = providerCode;
  }
}

// Database errors
export class DatabaseError extends BaseError {
  constructor(message: string, operation?: string, originalError?: Error) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      false,
      { operation, originalError: originalError?.message }
    );
  }
}

export class TransactionError extends DatabaseError {
  constructor(message: string, operation?: string) {
    super(`Transaction failed: ${message}`, operation);
  }
}

// Configuration errors
export class ConfigurationError extends BaseError {
  constructor(message: string, missingConfig?: string[]) {
    super(
      message,
      'CONFIGURATION_ERROR',
      500,
      false,
      { missingConfig }
    );
  }
}

// File/Storage errors
export class StorageError extends BaseError {
  constructor(message: string, operation?: string, metadata?: Record<string, any>) {
    super(
      message,
      'STORAGE_ERROR',
      500,
      true,
      { operation, ...metadata }
    );
  }
}

export class FileSizeError extends StorageError {
  constructor(maxSize: number, actualSize: number) {
    super(
      `File size exceeds maximum allowed size of ${maxSize} bytes`,
      'upload',
      { maxSize, actualSize }
    );
  }
}

export class InvalidFileTypeError extends StorageError {
  constructor(allowedTypes: string[], actualType: string) {
    super(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      'upload',
      { allowedTypes, actualType }
    );
  }
}

// Integration errors
export class IntegrationError extends BaseError {
  constructor(integration: string, message: string, metadata?: Record<string, any>) {
    super(
      `${integration} integration error: ${message}`,
      'INTEGRATION_ERROR',
      500,
      true,
      { integration, ...metadata }
    );
  }
}

// Timeout error
export class TimeoutError extends BaseError {
  constructor(operation: string, timeout: number) {
    super(
      `Operation '${operation}' timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      504,
      true,
      { operation, timeout }
    );
  }
}

// Error handler utility
export class ErrorHandler {
  public static isOperationalError(error: Error): boolean {
    if (error instanceof BaseError) {
      return error.isOperational;
    }
    return false;
  }

  public static handleError(error: Error, logger?: any): void {
    if (logger) {
      logger.error('Error occurred', error);
    }

    if (!ErrorHandler.isOperationalError(error)) {
      // For non-operational errors, we might want to crash the process
      process.exit(1);
    }
  }

  public static formatError(error: Error): ErrorResponse {
    if (error instanceof BaseError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        metadata: error.metadata,
        timestamp: new Date().toISOString()
      };
    }

    // Default error format for unknown errors
    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString()
    };
  }
}

export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  metadata?: Record<string, any>;
  timestamp: string;
}