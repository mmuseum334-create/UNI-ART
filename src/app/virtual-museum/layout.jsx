/**
 * Layout dedicado para /virtual-museum
 *
 * Al definir este layout en la misma carpeta de la ruta, Next.js lo usa
 * como layout de segmento y NO hereda Navbar/Footer del layout raíz.
 * Los providers globales (ThemeProvider, AuthProvider, ColorProvider)
 * siguen aplicándose desde el RootLayout (html + body).
 *
 * Esto elimina los warnings "preloaded but not used" porque el museo
 * virtual es pantalla completa y no necesita fuentes web ni el logo.
 */

export const metadata = {
  title: 'Museo Virtual | UNI-ART',
  description: 'Explora nuestra galería de arte en un entorno virtual inmersivo',
};

export default function VirtualMuseumLayout({ children }) {
  // Sin Navbar, Footer ni pt-16 del layout raíz.
  // El museo usa fixed inset-0 y no requiere esos recursos.
  return <>{children}</>;
}
