// src/components/ui/Layout.tsx
import { type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

export function Layout({ children }: { children: ReactNode }) {
  const { logout, userRole } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-indigo-600 text-white shadow-md w-full p-4 flex justify-between items-center">
        <div className="text-2xl font-semibold tracking-wide">Медицинская система</div>
        <div className="flex items-center gap-4">
          <span className="capitalize font-medium">Роль: {userRole}</span>
          <Button variant="ghost" className="text-white hover:bg-indigo-500" onClick={logout}>
            Выйти
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
