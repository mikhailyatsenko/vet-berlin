'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { SelectOption } from '@/lib/types';

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  description?: string;
  loading?: boolean;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ 
    className, 
    label, 
    options, 
    error,
    description,
    loading = false,
    id,
    name,
    ...props 
  }, ref) => {
    // Use name as fallback for stable ID generation
    const fieldId = id || `select-${name || 'field'}`;
    
    return (
      <div className="space-y-1">
        <label 
          htmlFor={fieldId} 
          className="sr-only"
        >
          {label}
        </label>
        
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={clsx(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
              'px-3 py-2 text-sm', // Match button height
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              loading && 'pr-10',
              className
            )}
            disabled={props.disabled || loading}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;
