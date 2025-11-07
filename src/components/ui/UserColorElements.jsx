/**
 * @fileoverview Componentes auxiliares para aplicar colores de usuario
 * @description Maneja tanto colores sólidos como gradientes correctamente
 */

'use client';

import { useColor } from '@/contexts/ColorContext';

/**
 * Badge con color del usuario
 */
export const UserColorBadge = ({ children, className = '', ...props }) => {
  const { color } = useColor();

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${className}`}
      style={{ background: color }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Botón con color del usuario
 */
export const UserColorButton = ({ children, className = '', ...props }) => {
  const { color } = useColor();

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 ${className}`}
      style={{ background: color }}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Icono circular con fondo de color del usuario
 */
export const UserColorIconCircle = ({ children, className = '' }) => {
  const { color } = useColor();

  return (
    <div
      className={`rounded-full p-3 ${className}`}
      style={{ background: color }}
    >
      {children}
    </div>
  );
};

/**
 * Sección con fondo de color del usuario
 */
export const UserColorSection = ({ children, className = '' }) => {
  const { color } = useColor();

  return (
    <section
      className={className}
      style={{ background: color }}
    >
      {children}
    </section>
  );
};
