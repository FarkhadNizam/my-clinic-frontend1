import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  token: string | null; // Добавляем token в тип
  login: (token: string, role: string) => void; // Обновляем сигнатуру
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null); // Добавляем состояние для токена
  const navigate = useNavigate();

  const isAuthenticated = !!userRole;

  const login = (token: string, role: string) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('token', token); // Сохраняем токен
    setUserRole(role);
    setToken(token); // Устанавливаем токен в состояние
    navigate(`/${role}`);
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token'); // Удаляем токен
    setUserRole(null);
    setToken(null); // Сбрасываем токен
    navigate('/login');
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token'); // Получаем токен при инициализации
    if (role && token) {
      setUserRole(role);
      setToken(token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      token, // Пробрасываем токен в контекст
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};