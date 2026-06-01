import { type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Spinner } from './Spinner'; // Предполагается, что у вас есть компонент Spinner

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  loading?: boolean;
}

export function Button({ 
  className, 
  variant = 'default', 
  loading = false,
  disabled,
  children,
  ...props 
}: ButtonProps) {
  const base =
    'px-5 py-2.5 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex items-center justify-center gap-2';

  const variants = {
    default:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg',
    outline:
      'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100',
    ghost:
      'bg-transparent text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200',
  };

  return (
    <button
      className={clsx(
        base, 
        variants[variant], 
        (disabled || loading) && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-5 w-5" />}
      {children}
    </button>
  );
}