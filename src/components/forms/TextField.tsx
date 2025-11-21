'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  helperText?: string;
  loading?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ 
    className, 
    label, 
    error, 
    description,
    helperText,
    loading = false,
    id,
    name,
    ...props 
  }, ref) => {
    // Use name as fallback for stable ID generation
    const fieldId = id || `text-${name || 'field'}`;
    
    return (
      <div className="space-y-1">
        <label 
          htmlFor={fieldId} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            className={clsx(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              loading && 'pr-10',
              className
            )}
            disabled={props.disabled || loading}
            {...props}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
        
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
