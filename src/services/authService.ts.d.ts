// Type definitions for authService

export interface AuthResult {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
  message?: string;
  needsEmailConfirmation?: boolean;
}