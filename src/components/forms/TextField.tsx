'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  helperText?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ 
    className, 
    label, 
    error, 
    description,
    helperText,
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
        
        <input
          ref={ref}
          id={fieldId}
          className={clsx(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        
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
