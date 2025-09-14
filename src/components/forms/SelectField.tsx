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
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ 
    className, 
    label, 
    options, 
    error,
    description,
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
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        
        <select
          ref={ref}
          id={fieldId}
          className={clsx(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
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
