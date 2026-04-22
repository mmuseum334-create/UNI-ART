/**
 * @fileoverview Layout raíz de la aplicación Next.js
 * @description Define el layout principal que envuelve todas las páginas
 * Incluye providers globales (Theme, Auth) y componentes compartidos (Navbar)
 */

import { Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ColorProvider } from '@/contexts/ColorContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ThemedToaster from '@/components/layout/ThemedToaster';

// Configuración de la fuente Poppins
// display:'optional' evita que Next.js genere <link rel="preload"> para cada
// variante de peso, eliminando los warnings "preloaded but not used".
// La fuente se aplica si ya está en caché; si no, el browser usa el fallback
// sin bloquear el render (comportamiento óptimo para producción).
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'optional',
  preload: false,
});

// Metadata para SEO
export const metadata = {
  title: 'Museum - Galería de Arte Digital',
  description: 'Explora y descubre obras de arte en realidad aumentada',
  keywords: ['museo', 'arte', 'AR', 'realidad aumentada', 'galería'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider>
          <AuthProvider>
            <ColorProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
                <Navbar />
                <main className="pt-16">
                  {children}
                </main>
                <Footer />
              </div>
              <ThemedToaster />
            </ColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
