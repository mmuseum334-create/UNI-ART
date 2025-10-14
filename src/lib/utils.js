import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date) => {
  if (!date) return 'Fecha no disponible';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};