'use client';

import { useEffect } from 'react';
import { Toaster, sileo } from 'sileo';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemedToaster() {
  const { isDark } = useTheme();

  useEffect(() => {
    sileo.dismiss();
  }, [isDark]);

  return (
    <Toaster
      position="top-center"
      theme={isDark ? 'dark' : 'light'}
    />
  );
}
