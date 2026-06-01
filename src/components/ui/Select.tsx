import { type ChangeEvent } from 'react';

interface SelectProps {
  label: string;
  name?: string; // Добавляем name в пропсы
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string; subLabel?: string }[];
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Select({ 
  label, 
  name, // Получаем name из пропсов
  value, 
  onChange, 
  options, 
  className = '', 
  required = false, 
  disabled = false 
}: SelectProps) {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={name} // Передаем name в select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
          disabled 
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
            : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
        }`}
      >
        <option value="">Выберите...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} {option.subLabel && `(${option.subLabel})`}
          </option>
        ))}
      </select>
    </div>
  );
}