'use client';

import { useEffect } from 'react';
import { Toaster, sileo } from 'sileo';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemedToaster() {
  const { isDark } = useTheme();

  // Al cambiar el tema, descarta toasts activos para evitar bg desactualizado
  useEffect(() => {
    sileo.dismiss();
  }, [isDark]);

  return (
    <Toaster
      position="top-center"
      options={{ fill: isDark ? '#171717' : '#eeeeee' }}
    />
  );
}
