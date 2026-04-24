'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useColor } from '@/contexts/ColorContext';
import {
  Home,
  Images,
  ScanEye,
  User,
  MapPin,
  Facebook,
  Instagram,
  Palette,
  Star,
} from 'lucide-react';

const Footer = () => {
  const { color } = useColor();

  const navLinks = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/catalog', icon: Images, label: 'Catálogo' },
    { href: '/ar', icon: ScanEye, label: 'Realidad Aumentada' },
    { href: '/profile', icon: User, label: 'Mi Perfil' },
  ];

  const socialLinks = [
    { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  ];

  const highlights = [
    { icon: Palette, label: 'Pinturas' },
    { icon: Star, label: 'Esculturas 3D' },
    { icon: ScanEye, label: 'Realidad Aumentada' },
  ];

  return (
    <footer className="mx-4 rounded-t-2xl relative overflow-hidden bg-white dark:bg-[#0f0f0f] border-t border-border">
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"
        style={{ backgroundColor: color }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16 lg:pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">

            {/* Brand */}
            <div className="lg:col-span-1 space-y-5">
              <Link href="/" className="inline-block group">
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl font-bold transition-colors duration-300"
                    style={{ color }}
                  >
                    UniArt
                  </span>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Museo Virtual de Arte — Un espacio digital donde la creatividad y la cultura se encuentran. Explora, crea y comparte arte sin límites.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground hover:border-transparent transition-all duration-300"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = color;
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = '';
                    }}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation — two columns */}
            <div className="space-y-7">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                Navegación
              </h3>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-7">
                {navLinks.map(({ href, icon: Icon, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 bg-background border border-border"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color }} />
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location only */}
            <div className="space-y-7">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                Ubicación
              </h3>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 bg-background border border-border"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <MapPin className="h-3.5 w-3.5" style={{ color }} />
                </span>
                <span className="pt-1.5">
                  Universidad de la Paz — UNIPAZ<br />
                  Barrancabermeja, Santander
                </span>
              </div>
            </div>

            {/* Lo que ofrecemos */}
            <div className="space-y-7">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                Obras
              </h3>
              <ul className="space-y-7">
                {highlights.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 bg-background border border-border"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Museo Virtual UniArt — UNIPAZ. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Privacidad
              </Link>
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Términos
              </Link>
              <div
                className="h-1.5 w-20 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
