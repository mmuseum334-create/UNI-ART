'use client';

/**
 * ConditionalShell — envuelve Navbar y Footer condicionalmente.
 * Oculta ambos componentes en las rutas listadas en HIDDEN_NAV_ROUTES.
 */

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

const HIDDEN_NAV_ROUTES = ['/auth'];

export default function ConditionalShell({ children }) {
  const pathname = usePathname();
  const hideNav = HIDDEN_NAV_ROUTES.some((route) => pathname?.startsWith(route));

  return (
    <>
      {!hideNav && <Navbar />}
      <main>{children}</main>
      {!hideNav && <Footer />}
    </>
  );
}
