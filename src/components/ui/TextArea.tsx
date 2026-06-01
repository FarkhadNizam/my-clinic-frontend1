import React from 'react';

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className={`text-sm font-semibold ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`
          w-full
          rounded-lg
          border
          px-3
          py-2
          text-base
          shadow-sm
          focus:outline-none
          focus:ring-2
          transition
          resize-y
          ${
            disabled
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
          }
        `}
      />
    </div>
  );
};