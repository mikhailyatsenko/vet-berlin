'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
  loading?: boolean;
}

const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ 
    className, 
    label, 
    description, 
    error, 
    loading = false,
    disabled,
    id,
    name,
    ...props 
  }, ref) => {
    // Use name as fallback for stable ID generation
    const fieldId = id || `checkbox-${name || 'field'}`;
    
    return (
      <div className="flex items-start gap-2">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={fieldId}
            disabled={disabled || loading}
            className={clsx(
              'rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-300 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        
        <div className="flex-1">
          <label 
            htmlFor={fieldId} 
            className={clsx(
              'text-sm cursor-pointer flex items-center gap-2',
              loading ? 'opacity-50' : 'text-gray-700',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            )}
            {label}
          </label>
          
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';

export default CheckboxField;
