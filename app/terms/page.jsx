'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f0f]">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Términos y Condiciones
            </h1>
            <p className="text-sm text-slate-500 dark:text-white/40 mt-0.5">
              Última actualización: Abril 2026
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm text-slate-700 dark:text-white/70 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              1. Aceptación de los términos
            </h2>
            <p>
              Al acceder y utilizar UNI-ART, aceptas estar sujeto a estos Términos y
              Condiciones de Uso. Si no estás de acuerdo con alguna parte de estos
              términos, no debes utilizar la plataforma.
            </p>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              2. Descripción del servicio
            </h2>
            <p>
              UNI-ART es una plataforma de galería de arte digital desarrollada por
              estudiantes de UNIPAZ. Permite a los usuarios explorar, publicar y
              interactuar con obras de arte, incluyendo pinturas y esculturas generadas
              con tecnología de inteligencia artificial.
            </p>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              3. Uso aceptable
            </h2>
            <p>Aceptas no utilizar la plataforma para:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Publicar contenido que infrinja derechos de autor de terceros.</li>
              <li>Subir material ofensivo, discriminatorio o ilegal.</li>
              <li>Intentar acceder sin autorización a otras cuentas o sistemas.</li>
              <li>Usar bots o scripts automatizados sin permiso expreso.</li>
            </ul>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              4. Propiedad intelectual
            </h2>
            <p>
              Los usuarios conservan los derechos de las obras que publican. Al
              publicar contenido en UNI-ART, otorgas a la plataforma una licencia no
              exclusiva para mostrar dicho contenido dentro del servicio.
            </p>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              5. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier
              momento. Las modificaciones entran en vigor al publicarse en esta página.
              El uso continuado de la plataforma implica la aceptación de los términos
              actualizados.
            </p>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              6. Contacto
            </h2>
            <p>
              Para preguntas sobre estos términos, puedes contactarnos a través de
              los canales oficiales de UNIPAZ.
            </p>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#171717] flex flex-col sm:flex-row items-center gap-4 justify-between">
          <p className="text-sm text-slate-600 dark:text-white/50 text-center sm:text-left">
            ¿Tienes dudas? También puedes revisar nuestra{' '}
            <Link href="/privacy" className="underline hover:text-slate-900 dark:hover:text-white transition-colors">
              Política de Privacidad
            </Link>
            .
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
