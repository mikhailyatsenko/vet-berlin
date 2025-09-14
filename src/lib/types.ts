/**
 * Common types used across the application
 */

export interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SearchFilters {
  text?: string;
  category?: string;
  neighborhood?: string;
  page?: number;
  pageSize?: number;
  openNow?: boolean;
}

export interface StatsCard {
  value: number;
  label: string;
  color: 'blue' | 'yellow' | 'green' | 'purple' | 'red' | 'indigo';
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  defaultValue?: string | boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Re-export commonly used types from mongodb
export type { Veterinarian, SearchFilters as DatabaseSearchFilters } from './mongodb';
