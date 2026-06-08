import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: any, showToast: boolean = true) => {
  console.error('Error:', error);

  let message = 'An unexpected error occurred';
  let code = 'UNKNOWN_ERROR';

  if (error instanceof AppError) {
    message = error.message;
    code = error.code || 'APP_ERROR';
  } else if (error?.code) {
    code = error.code;
    message = getFirebaseErrorMessage(error.code);
  } else if (error?.message) {
    message = error.message;
  }

  if (showToast) {
    toast.error(message);
  }

  return { message, code };
};

export const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'Operation not allowed.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/requires-recent-login': 'Please log in again to complete this action.',
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'The resource already exists.',
    'resource-exhausted': 'Resource limit exceeded. Please try again later.',
    'unauthenticated': 'You must be logged in to perform this action.',
  };

  return errorMessages[code] || 'An error occurred. Please try again.';
};

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
};
