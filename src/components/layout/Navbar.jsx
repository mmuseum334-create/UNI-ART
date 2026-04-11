/**
 * @fileoverview Barra de navegación principal
 * @description Componente de navegación global con menú responsive
 * Client Component - usa hooks de estado y navegación
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useColor } from '@/contexts/ColorContext';
import { Button } from '@/components/ui/Button';
import { AnimatedThemeToggler } from '@/components/ui/AnimatedThemeToggler';
import ColorPicker from '@/components/ui/ColorPicker';
import {
  Menu,
  X,
  User,
  LogOut,
  Upload,
  Home,
  BookImage,
  ScanEye,
  Images,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const profileRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = usePermissions();
  const { color } = useColor();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0;

      setScrollProgress(progress);
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 5) {
        setIsVisible(false);
        setIsProfileOpen(false);
      } else if (currentScrollY < lastScrollY - 5) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar, { passive: true });
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsProfileOpen(false);
  };

  const navLinks = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/catalog', icon: Images, label: 'Catálogo' },
    { href: '/ar', icon: ScanEye, label: 'Realidad Aumentada' },
  ];

  const userLinks = [
    { href: '/profile', icon: User, label: 'Mi Perfil' },
    { href: '/upload', icon: Upload, label: 'Subir Arte' },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-primary border-b border-slate-200 dark:border-dark-tertiary transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      {/* Barra de progreso de scroll */}
      <div
        className="absolute bottom-0 left-0 h-0.5 transition-all duration-100"
        style={{ width: `${scrollProgress}%`, backgroundColor: color }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/logoverdee.png"
                alt="Logo Unipaz"
                className="h-[65px] w-20 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1 gap-2">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'text-slate-900 dark:text-white bg-[#f5f5f5] dark:bg-dark-tertiary/70'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-dark-tertiary/60'
                  }`}
                >
                  <IconComponent
                    className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                  />
                  <span>{link.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <AnimatedThemeToggler />
            {isAuthenticated && <ColorPicker />}

            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={isProfileOpen ? { borderColor: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.15)' } : {}}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                    isProfileOpen
                      ? 'border-transparent bg-slate-50 dark:bg-dark-tertiary/50'
                      : 'border-transparent hover:border-slate-200 dark:hover:border-dark-tertiary hover:bg-slate-50 dark:hover:bg-dark-tertiary/40'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-300/50 dark:ring-slate-600/50"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-dark-primary" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 text-sm font-medium max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180 text-slate-600 dark:text-slate-300' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-52 rounded-xl shadow-xl border border-white/30 dark:border-dark-tertiary/60 overflow-hidden transition-all duration-200 origin-top-right ${
                    isProfileOpen
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  } bg-white/90 dark:bg-dark-secondary/95 backdrop-blur-xl`}
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-tertiary/50">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Conectado como</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
                  </div>
                  {userLinks.map((link) => {
                    const IconComponent = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex items-center space-x-2.5 px-4 py-2.5 text-sm transition-colors ${
                          active
                            ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-dark-tertiary/70'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-tertiary/50'
                        }`}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                  {isAdmin() && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className={`flex items-center space-x-2.5 px-4 py-2.5 text-sm transition-colors ${
                        isActive('/admin')
                          ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                    >
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span>Administrador</span>
                    </Link>
                  )}
                  <div className="border-t border-slate-100 dark:border-dark-tertiary/50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-sm text-left text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-nature-500 to-museum-500 hover:from-nature-600 hover:to-museum-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Toggle + Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            <AnimatedThemeToggler />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-tertiary/60 transition-colors"
              aria-label="Toggle menu"
            >
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                  isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                }`}
              >
                <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </span>
              <span
                className={`flex items-center justify-center transition-all duration-200 ${
                  isMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
                }`}
              >
                <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-3 border-t border-slate-100 dark:border-dark-tertiary/50 space-y-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-dark-tertiary/70'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-tertiary/60'
                  }`}
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span>{link.label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-400" />
                  )}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <>
                <div className="pt-2 pb-1 px-4">
                  <div className="h-px bg-slate-100 dark:bg-dark-tertiary/50" />
                </div>
                <div className="flex items-center space-x-3 px-4 py-2.5">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-300/50 dark:ring-slate-600/50"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-dark-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Activo ahora</p>
                  </div>
                </div>
                {userLinks.map((link) => {
                  const IconComponent = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-dark-tertiary/70'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-tertiary/60'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                {isAdmin() && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>Administrador</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 px-4 pt-2 pb-1">
                <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="block">
                  <Button variant="outline" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="block">
                  <Button className="w-full bg-gradient-to-r from-nature-500 to-museum-500 hover:from-nature-600 hover:to-museum-600 text-white border-0">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
