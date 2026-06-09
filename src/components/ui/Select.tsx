import { type ChangeEvent, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface SelectProps {
  label?: string;
  name?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label,
    name,
    value,
    onChange,
    options,
    placeholder = "Выберите...",
    className = '',
    required = false,
    disabled = false,
    error,
    helperText,
  }, ref) => {
    return (
      <div className={`flex flex-col space-y-1 ${className}`}>
        {label && (
          <label className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all
            ${disabled 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white hover:border-gray-400'
            }
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} {option.subLabel && `(${option.subLabel})`}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';