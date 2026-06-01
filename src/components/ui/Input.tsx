// components/ui/Input.tsx
import React from 'react';

export function Input({
  label,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}
      <input
        {...props}
        className="
          w-full
          px-4 py-3
          border border-gray-300
          rounded-md
          shadow-sm
          text-gray-900
          placeholder-gray-400
          focus:outline-none
          focus:ring-2 focus:ring-indigo-500
          focus:border-indigo-500
          transition
          duration-200
          ease-in-out
        "
      />
    </div>
  );
}
