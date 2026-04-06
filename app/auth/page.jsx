/**
 * @fileoverview Página de autenticación
 * Ruta: app/auth/page.jsx
 */

'use client';

import { Suspense } from 'react';
import Auth from '@/pages/Auth';

function AuthFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Cargando...</p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <Auth />
    </Suspense>
  );
}