'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-500/15 flex items-center justify-center">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Política de Privacidad
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
              1. Información que recopilamos
            </h2>
            <p>
              UNI-ART recopila la información necesaria para operar la plataforma:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Datos de registro:</strong> nombre, correo electrónico y contraseña (almacenada en hash).</li>
              <li><strong>Contenido publicado:</strong> imágenes, títulos, descripciones y etiquetas de obras.</li>
              <li><strong>Actividad en la plataforma:</strong> likes, vistas y preferencias de color.</li>
            </ul>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              2. Cómo usamos tu información
            </h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Gestionar tu cuenta y autenticarte en la plataforma.</li>
              <li>Mostrar tu contenido publicado en la galería.</li>
              <li>Calcular estadísticas de obras (likes y vistas).</li>
              <li>Personalizar tu experiencia (color de interfaz, preferencias).</li>
            </ul>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              3. Compartir información con terceros
            </h2>
            <p>
              No vendemos ni compartimos tu información personal con terceros, salvo
              en los siguientes casos:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Servicios de infraestructura (Supabase, Render) necesarios para operar la plataforma.</li>
              <li>Cuando sea requerido por obligación legal.</li>
            </ul>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              4. Almacenamiento y seguridad
            </h2>
            <p>
              Tus datos se almacenan en Supabase con cifrado en tránsito (HTTPS) y en
              reposo. Las contraseñas nunca se almacenan en texto plano. Tomamos
              medidas razonables para proteger tu información, aunque ningún sistema
              es 100% seguro.
            </p>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              5. Tus derechos
            </h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Acceder a los datos que tenemos sobre ti.</li>
              <li>Solicitar la corrección de datos inexactos.</li>
              <li>Solicitar la eliminación de tu cuenta y datos asociados.</li>
            </ul>
            <p>
              Para ejercer estos derechos, contacta a los administradores de la
              plataforma a través de los canales oficiales de UNIPAZ.
            </p>
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              6. Cookies y almacenamiento local
            </h2>
            <p>
              Utilizamos cookies de sesión para mantenerte autenticado y
              <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-xs font-mono">localStorage</code>
              para guardar preferencias de interfaz (color, tema). No usamos cookies
              de seguimiento de terceros.
            </p>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#171717] flex flex-col sm:flex-row items-center gap-4 justify-between">
          <p className="text-sm text-slate-600 dark:text-white/50 text-center sm:text-left">
            ¿Tienes dudas? También puedes revisar nuestros{' '}
            <Link href="/terms" className="underline hover:text-slate-900 dark:hover:text-white transition-colors">
              Términos y Condiciones
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
