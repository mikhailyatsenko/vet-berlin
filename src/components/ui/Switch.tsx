import { forwardRef } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { clsx } from 'clsx';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({
    checked,
    onChange,
    disabled = false,
    label,
    description,
    className,
    size = 'md',
    ...props
  }, ref) => {
    const sizes = {
      sm: {
        switch: 'h-4 w-7',
        thumb: 'h-3 w-3',
        translate: 'translate-x-3'
      },
      md: {
        switch: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'translate-x-4'
      },
      lg: {
        switch: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'translate-x-5'
      }
    };

    const currentSize = sizes[size];

    return (
      <div className={clsx('flex items-center', className)}>
        <HeadlessSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          className={clsx(
            'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            currentSize.switch,
            checked ? 'bg-blue-600' : 'bg-gray-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          {...props}
        >
          <span
            className={clsx(
              'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
              currentSize.thumb,
              checked ? currentSize.translate : 'translate-x-0'
            )}
          />
        </HeadlessSwitch>
        
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
