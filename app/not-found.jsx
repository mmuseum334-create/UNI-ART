'use client';

import Link from 'next/link';
import { useColor } from '@/contexts/ColorContext';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { color } = useColor();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-primary dark:to-dark-secondary">

      {/* Número grande */}
      <div className="relative mb-6 select-none">
        <span
          className="text-[160px] sm:text-[220px] font-black leading-none opacity-10 dark:opacity-5"
          style={{ color }}
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl shadow-xl" style={{ backgroundColor: color }}>
            <Search className="h-12 w-12 text-white" />
          </div>
        </div>
      </div>

      {/* Texto */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
        Página no encontrada
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
        La obra que buscas no existe o fue movida a otra galería. Puede que el enlace esté incorrecto.
      </p>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: color }}
        >
          <Home className="h-4 w-4" />
          Ir al inicio
        </Link>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-tertiary transition-colors"
        >
          <Search className="h-4 w-4" />
          Ver catálogo
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver atrás
        </button>
      </div>
    </div>
  );
}
