'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/user/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
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

      console.log('🔍 Cargando usuario al iniciar...'); // DEBUG
      console.log('👤 Usuario en localStorage:', storedUser); // DEBUG
      console.log('🔑 Token en localStorage:', token); // DEBUG

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ Usuario cargado:', parsedUser); // DEBUG
        setUser(parsedUser);
      } else {
        console.log('❌ No hay usuario o token guardado'); // DEBUG
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);

      console.log('🔐 Login result:', result); // DEBUG

      if (result.success && result.data) {
        console.log('✅ Login exitoso, datos recibidos:', result.data); // DEBUG

        // Guardar toda la info del usuario que viene del backend
        const userData = {
          ...result.data.user, // Toda la info del backend
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.data.user?.email || email}`,
        };

        console.log('👤 Usuario a guardar:', userData); // DEBUG
        console.log('🔑 Token guardado:', localStorage.getItem('museum_token')); // DEBUG

        localStorage.setItem('museum_user', JSON.stringify(userData));
        setUser(userData);

        return { success: true };
      }

      console.error('❌ Login falló:', result); // DEBUG
      return result;
    } catch (error) {
      console.error('💥 Error en login:', error); // DEBUG
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
        // Auto-login: guardar usuario directamente
        const userData = {
          ...result.data,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.data.email}`,
        };
        
        localStorage.setItem('museum_user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true };
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