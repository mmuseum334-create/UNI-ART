'use client';

import { Toaster } from 'sileo';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-center"
      options={{ fill: isDark ? '#171717' : '#eeeeee' }}
    />
  );
}
