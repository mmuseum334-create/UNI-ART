'use client';

import { useEffect } from 'react';
import { Toaster, sileo } from 'sileo';
import { useTheme } from '@/contexts/ThemeContext';
import { setToastFill } from '@/lib/toast';

export default function ThemedToaster() {
  const { isDark } = useTheme();
  const fill = isDark ? '#171717' : '#eeeeee';

  // Actualiza el fill del módulo toast sincrónicamente en cada render
  setToastFill(fill);

  useEffect(() => {
    // Al cambiar el tema, descarta toasts activos (ya tienen fill viejo baked-in)
    sileo.dismiss();
  }, [isDark]);

  return <Toaster position="top-center" />;
}
