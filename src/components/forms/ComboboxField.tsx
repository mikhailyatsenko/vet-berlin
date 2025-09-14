'use client';

import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { SelectOption } from '@/lib/types';

interface ComboboxFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export default function ComboboxField({
  name,
  label,
  options,
  value,
  onChange,
  placeholder = "Search...",
  error,
  description,
  className,
  disabled = false
}: ComboboxFieldProps) {
  const [query, setQuery] = useState('');

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={clsx('space-y-1', className)}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      
      <Combobox 
        value={value} 
        onChange={(newValue) => {
          onChange(newValue || '');
          setQuery(''); // Clear search when selection is made
        }}
        disabled={disabled}
      >
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
            <Combobox.Input
              className={clsx(
                'w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0',
                error && 'text-red-900',
                disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
              )}
              displayValue={() => selectedOption?.label || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    className={({ active }) =>
                      clsx(
                        'relative cursor-default select-none py-2 pl-10 pr-4',
                        active ? 'bg-blue-600 text-white' : 'text-gray-900',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )
                    }
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={clsx(
                            'block truncate',
                            selected ? 'font-medium' : 'font-normal'
                          )}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={clsx(
                              'absolute inset-y-0 left-0 flex items-center pl-3',
                              active ? 'text-white' : 'text-blue-600'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
