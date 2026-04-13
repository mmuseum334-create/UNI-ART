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
import { Toaster } from 'sileo';

// Configuración de la fuente Poppins
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

// Metadata para SEO
export const metadata = {
  title: 'Museum - Galería de Arte Digital',
  description: 'Explora y descubre obras de arte en realidad aumentada',
  keywords: ['museo', 'arte', 'AR', 'realidad aumentada', 'galería'],
};

/**
 * RootLayout - Componente de layout principal
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={poppins.className}>
        {/* Provider de tema (dark/light mode) */}
        <ThemeProvider>
          {/* Provider de autenticación */}
          <AuthProvider>
            {/* Provider de color personalizado */}
            <ColorProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
                <Navbar />
                <main className="pt-16">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster position="top-center" />
            </ColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
