/**
 * @fileoverview Selector de color personalizado
 * @description Permite al usuario elegir su color personalizado con presets y selector HSL
 */

'use client';

import { useState, useEffect } from 'react';
import { useColor } from '@/contexts/ColorContext';
import { Palette, Check } from 'lucide-react';

const ColorPicker = () => {
  const { color, setColor } = useColor();
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(207); // Matiz (0-360)
  const [saturation, setSaturation] = useState(80); // Saturación (0-100)
  const [lightness, setLightness] = useState(55); // Luminosidad (0-100)

  const [colorType, setColorType] = useState('solid'); // 'solid' o 'gradient'

  // Colores sólidos predeterminados
  const presetColors = [
    { name: 'Azul', color: '#328CE7' },
    { name: 'Verde', color: '#22C55E' },
    { name: 'Púrpura', color: '#A855F7' },
    { name: 'Rosa', color: '#EC4899' },
    { name: 'Naranja', color: '#F97316' },
    { name: 'Cyan', color: '#06B6D4' },
  ];

  // Gradientes predeterminados
  const presetGradients = [
    { name: 'Océano', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Atardecer', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Bosque', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Aurora', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { name: 'Neón', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { name: 'Fuego', gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)' },
  ];

  // Convertir color hex a HSL al montar
  useEffect(() => {
    const hexToHSL = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return { h: 207, s: 80, l: 55 };

      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    };

    const hsl = hexToHSL(color);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [color]);

  // Convertir HSL a Hex
  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const rgb = [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];

    return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  // Actualizar color cuando cambian los sliders
  const handleHSLChange = (newHue, newSat, newLight) => {
    const newColor = hslToHex(newHue, newSat, newLight);
    setColor(newColor);
  };

  return (
    <div className="relative">
      {/* Botón para abrir el picker - Solo icono */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg glass-effect hover:bg-white/50 dark:hover:bg-dark-tertiary/50 transition-colors"
        title="Cambiar color del tema"
      >
        <Palette className="h-5 w-5" style={{ color }} />
      </button>

      {/* Panel del Color Picker */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-72 p-3 glass-effect dark:bg-dark-secondary/95 rounded-lg shadow-xl border border-white/20 dark:border-dark-tertiary/50 z-50">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
              Personaliza tu tema
            </h3>

            {/* Toggle entre Sólido y Gradiente */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setColorType('solid')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  colorType === 'solid'
                    ? 'user-color-bg text-white'
                    : 'bg-slate-200 dark:bg-dark-tertiary text-slate-600 dark:text-slate-400'
                }`}
              >
                Sólido
              </button>
              <button
                onClick={() => setColorType('gradient')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  colorType === 'gradient'
                    ? 'user-color-bg text-white'
                    : 'bg-slate-200 dark:bg-dark-tertiary text-slate-600 dark:text-slate-400'
                }`}
              >
                Gradiente
              </button>
            </div>

            {/* Colores o Gradientes predeterminados */}
            {colorType === 'solid' ? (
              <div className="mb-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  Colores rápidos:
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {presetColors.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => setColor(preset.color)}
                      className="relative w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    >
                      {color === preset.color && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  Gradientes rápidos:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {presetGradients.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setColor(preset.gradient)}
                      className="relative w-full h-10 rounded-lg border-2 border-white shadow-md hover:scale-105 transition-transform"
                      style={{ background: preset.gradient }}
                      title={preset.name}
                    >
                      {color === preset.gradient && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector HSL - Solo para colores sólidos */}
            {colorType === 'solid' && (
            <div className="space-y-2">
              {/* Matiz (Hue) */}
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                  Matiz: {hue}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => {
                    const newHue = parseInt(e.target.value);
                    setHue(newHue);
                    handleHSLChange(newHue, saturation, lightness);
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right,
                      hsl(0, 100%, 50%),
                      hsl(60, 100%, 50%),
                      hsl(120, 100%, 50%),
                      hsl(180, 100%, 50%),
                      hsl(240, 100%, 50%),
                      hsl(300, 100%, 50%),
                      hsl(360, 100%, 50%)
                    )`
                  }}
                />
              </div>

              {/* Saturación */}
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                  Saturación: {saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={saturation}
                  onChange={(e) => {
                    const newSat = parseInt(e.target.value);
                    setSaturation(newSat);
                    handleHSLChange(hue, newSat, lightness);
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right,
                      hsl(${hue}, 0%, ${lightness}%),
                      hsl(${hue}, 100%, ${lightness}%)
                    )`
                  }}
                />
              </div>

              {/* Luminosidad */}
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                  Luminosidad: {lightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lightness}
                  onChange={(e) => {
                    const newLight = parseInt(e.target.value);
                    setLightness(newLight);
                    handleHSLChange(hue, saturation, newLight);
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right,
                      hsl(${hue}, ${saturation}%, 0%),
                      hsl(${hue}, ${saturation}%, 50%),
                      hsl(${hue}, ${saturation}%, 100%)
                    )`
                  }}
                />
              </div>
            </div>
            )}

            {/* Preview */}
            <div className="mt-3 p-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Vista previa:
                </span>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-10 h-10 rounded-lg shadow-lg"
                    style={
                      color.startsWith('linear-gradient')
                        ? { background: color }
                        : { backgroundColor: color }
                    }
                  />
                  <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {color.startsWith('linear-gradient') ? 'Gradiente' : color.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPicker;
