/**
 * @fileoverview Barra de navegación principal
 * @description Componente de navegación global con menú responsive
 * Client Component - usa hooks de estado y navegación
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { AnimatedThemeToggler } from '@/components/ui/AnimatedThemeToggler';
import {
  Menu,
  X,
  User,
  LogOut,
  Upload,
  Heart,
  Search,
  Home,
  Box
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsProfileOpen(false);
  };

  const navLinks = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/catalog', icon: Search, label: 'Catálogo' },
    { href: '/ar', icon: Box, label: 'Realidad Aumentada' },
  ];

  const userLinks = [
    { href: '/profile', icon: User, label: 'Mi Perfil' },
    { href: '/upload', icon: Upload, label: 'Subir Arte' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-white/20 dark:border-dark-tertiary/50 dark:bg-dark-primary/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/LogoUnipaz.png"
              alt="Logo Unipaz"
              className="h-11 w-11 object-contain"
            />
            <span className="text-xl font-display font-bold text-gradient dark:text-white">
              UniART
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 hover:text-nature-600 dark:hover:text-nature-400 transition-colors"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <AnimatedThemeToggler />
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-dark-tertiary/50 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{user.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-effect dark:bg-dark-secondary/95 rounded-lg shadow-lg border border-white/20 dark:border-dark-tertiary/50 py-1">
                    {userLinks.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-dark-tertiary/50 transition-colors"
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                    <hr className="my-1 border-white/20 dark:border-dark-tertiary/50" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <AnimatedThemeToggler />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-dark-tertiary/50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              ) : (
                <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 dark:border-dark-tertiary/50">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-dark-tertiary/50 rounded-lg transition-colors"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <>
                  <hr className="my-2 border-white/20 dark:border-dark-tertiary/50" />
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{user.name}</span>
                  </div>
                  {userLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-dark-tertiary/50 rounded-lg transition-colors"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-4 pt-2">
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button className="w-full">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;