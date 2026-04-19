'use client'

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('❌ Error de Google:', decodeURIComponent(error));
        router.push(`/auth?error=${error}`);
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));

          const userData = {
            ...user,
            avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          };

          localStorage.setItem('museum_token', token);
          localStorage.setItem('museum_user', JSON.stringify(userData));

          window.location.href = '/';
        } catch (err) {
          console.error('❌ Error procesando callback de Google:', err);
          router.push('/auth?error=' + encodeURIComponent('Error al procesar la autenticación'));
        }
      } else {
        console.error('❌ No se recibió token o usuario');
        router.push('/auth?error=' + encodeURIComponent('No se recibió información de autenticación'));
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-lg text-slate-600">Procesando autenticación con Google...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-lg text-slate-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}