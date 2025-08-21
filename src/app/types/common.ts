// Common types used across the application

// Icon mapping type
export type IconMap = Record<string, any>;

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic form error type
export interface FormErrors {
  [key: string]: string;
}
