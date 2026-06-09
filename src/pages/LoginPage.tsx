/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  // Очистка ошибки при вводе
  useEffect(() => {
    if (error) setError('');
  }, [login, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!login.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://localhost:7190/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Неверный логин или пароль');
      }

      authLogin(data.token, data.role);
      
      // Перенаправление в зависимости от роли
      switch (data.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'doctor':
          navigate('/doctor');
          break;
        case 'registrar':
          navigate('/registrar');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа. Проверьте данные и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Логотип/Иконка */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6v12M16 6v12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Добро пожаловать</h2>
            <p className="text-gray-600 text-sm">Войдите в систему поликлиники</p>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Поля ввода */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Логин
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="pl-10"
                  placeholder="Введите ваш логин"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Введите ваш пароль"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Дополнительные опции */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-gray-600">Запомнить меня</span>
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
              Забыли пароль?
            </a>
          </div>

          {/* Кнопка входа */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Вход...</span>
              </div>
            ) : (
              <span>Войти в систему</span>
            )}
          </Button>

          {/* Информация о ролях */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs text-center text-gray-500">
              Демо-доступ:
            </p>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="px-2 py-1 bg-gray-100 rounded">Admin: admin / admin</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Doctor: doctor / doctor</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Registrar: registrar / registrar</span>
            </div>
          </div>
        </form>
      </Card>

      {/* Нижний колонтитул */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500">
        © 2026 Поликлиника № 12.
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #4f46e5 1px, transparent 1px),
                            linear-gradient(to bottom, #4f46e5 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}