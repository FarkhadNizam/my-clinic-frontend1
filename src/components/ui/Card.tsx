// components/ui/Card.tsx
import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`
        bg-white
        p-10
        rounded-3xl
        shadow-xl
        border border-gray-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}
