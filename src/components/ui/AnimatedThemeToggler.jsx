/**
 * AnimatedThemeToggler - Magic UI style theme toggle with View Transition API
 * Creates an expanding circle animation when toggling themes
 */
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { MoonStar, Sun } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';

export function AnimatedThemeToggler({ className = '', duration = 400 }) {
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = useCallback(async () => {
    if (!buttonRef.current) {
      toggleTheme();
      return;
    }

    // Check if View Transition API is supported
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    // Start the view transition
    await document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
      });
    }).ready;

    // Get button position for circle expansion origin
    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    // Calculate the maximum radius needed to cover the entire viewport
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    // Animate the circle expansion
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  }, [toggleTheme, duration]);

  if (!mounted) {
    return (
      <button
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 transition-colors hover:bg-slate-100 ${className}`}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className={`group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg dark:text-slate-100 ${className}`}
      aria-label="Toggle theme"
    >
      {/* Sun Icon */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all"
        style={{
          transform: isDark ? 'rotate(180deg) scale(0)' : 'rotate(0deg) scale(1)',
          opacity: isDark ? 0 : 1,
          transition: `all ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        }}
      >
        <Sun
          className="h-5 w-5 text-amber-500 transition-all duration-300 group-hover:text-amber-600"
          style={{
            filter: !isDark ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' : 'none',
          }}
        />
      </div>

      {/* Moon Icon */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all"
        style={{
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-180deg) scale(0)',
          opacity: isDark ? 1 : 0,
          transition: `all ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        }}
      >
        <MoonStar
          className="h-5 w-5 text-blue-400 transition-all duration-300 group-hover:text-blue-500"
          style={{
            filter: isDark ? 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))' : 'none',
          }}
        />
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
        style={{
          boxShadow: isDark
            ? '0 0 20px rgba(96, 165, 250, 0.3)'
            : '0 0 20px rgba(251, 191, 36, 0.3)',
        }}
      />
    </button>
  );
}

export default AnimatedThemeToggler;
