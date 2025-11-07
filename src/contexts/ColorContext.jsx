/**
 * @fileoverview Context de color personalizado por usuario
 * @description Gestiona el color personalizado de cada usuario y lo aplica globalmente
 * Client Component - usa hooks de React y accede al DOM
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ColorContext = createContext();

export const useColor = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColor debe usarse dentro de un ColorProvider');
  }
  return context;
};

/**
 * Función auxiliar para oscurecer un color
 * @param {string} color - Color en formato hexadecimal
 * @param {number} amount - Cantidad a oscurecer (0-1)
 * @returns {string} Color oscurecido en hexadecimal
 */
const darkenColor = (color, amount) => {
  // Si es un gradiente, retornar el mismo gradiente (no se puede oscurecer)
  if (color.startsWith('linear-gradient')) {
    return color;
  }

  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export const ColorProvider = ({ children }) => {
  const [color, setColorState] = useState('#328CE7'); // Azul por defecto
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  // Cargar color del usuario al montar o cuando cambia el usuario
  useEffect(() => {
    setMounted(true);
    const loadUserColor = async () => {
      const localColor = localStorage.getItem('userColor') || '#328CE7';

      if (user?.color && user?.color === localColor) {
        setColorState(user.color);
        localStorage.setItem('userColor', user.color);
      } else {
        setColorState(localColor);
      }
    };

    loadUserColor();
  }, [user]);

  // Aplicar color como variable CSS global
  useEffect(() => {
    if (typeof window !== 'undefined' && color && mounted) {
      document.documentElement.style.setProperty('--user-color', color);
      document.documentElement.style.setProperty('--user-hover-color', darkenColor(color, 0.1));
    }
  }, [color, mounted]);

  // Función para cambiar el color
  const setColor = async (newColor) => {
    try {
      // Si el usuario está autenticado, actualizar en la BD
      if (user?.id) {
        const { userService } = await import('@/services/user/userService');
        const result = await userService.updateColor(user.id, newColor);

        if (!result.success) {
          console.error('Error actualizando color en BD:', result.error);
          // Aún así actualizamos localmente
        }
      }

      setColorState(newColor);
      localStorage.setItem('userColor', newColor);
    } catch (error) {
      console.error('Error actualizando el color del usuario:', error);
    }
  };

  if (!mounted) {
    return (
      <ColorContext.Provider value={{ color: '#328CE7', setColor: () => {} }}>
        {children}
      </ColorContext.Provider>
    );
  }

  return (
    <ColorContext.Provider value={{ color, setColor }}>
      {children}
    </ColorContext.Provider>
  );
};
