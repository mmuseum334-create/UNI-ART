'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/user/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Durante SSR (Server-Side Rendering), el contexto puede no estar disponible
  // Esto es normal cuando Next.js está construyendo las páginas
  if (!context) {
    // Si estamos en el servidor (build time), retornar valores por defecto
    if (typeof window === 'undefined') {
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: async () => ({ success: false }),
        register: async () => ({ success: false }),
        logout: () => {},
        updateProfile: () => {}
      };
    }
    // Si estamos en el cliente y no hay contexto, es un error real
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('museum_user');
      const token = authService.getToken();

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);

      if (result.success && result.data) {
        const userData = {
          ...result.data.user,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.data.user?.email || email}`,
        };

        localStorage.setItem('museum_user', JSON.stringify(userData));
        setUser(userData);

        return { success: true, user: userData };
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.register(name, email, password);
      
      if (result.success && result.data) {
        // Auto-login: guardar usuario directamente (incluye rol asignado automáticamente)
        const userData = {
          ...result.data.user,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.data.user?.email || result.data.email}`,
        };

        localStorage.setItem('museum_user', JSON.stringify(userData));
        setUser(userData);

        return { success: true, user: userData };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('museum_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};