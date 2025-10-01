/**
 * @fileoverview Context de autenticación de usuarios
 * @description Maneja el estado global de autenticación
 * Client Component - usa localStorage y hooks de React
 * NOTA: En producción con NestJS backend, reemplazar mock por llamadas API reales
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    const storedUser = localStorage.getItem('museum_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const mockUser = {
        id: '1',
        name: 'Usuario Demo',
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        joinedAt: new Date().toISOString(),
        artworks: [],
        favorites: [],
        isArtist: true
      };
      
      localStorage.setItem('museum_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const mockUser = {
        id: Date.now().toString(),
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        joinedAt: new Date().toISOString(),
        artworks: [],
        favorites: [],
        isArtist: true
      };
      
      localStorage.setItem('museum_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('museum_user');
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