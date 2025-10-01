/**
 * @fileoverview Configuración de Next.js para el proyecto Museum
 * @description Define la configuración del framework Next.js
 * Preparado para futura integración con NestJS backend
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo estricto de React para detectar problemas potenciales
  reactStrictMode: true,

  // Configuración de imágenes para optimización
  images: {
    // Dominios permitidos para cargar imágenes externas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Variables de entorno expuestas al cliente (prefijo NEXT_PUBLIC_)
  env: {
    // URL del backend NestJS (configurar cuando esté listo)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },

  // Configuración para WebXR y Three.js
  webpack: (config) => {
    // Permite importar archivos GLSL/GLB para Three.js
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag|glb|gltf)$/,
      exclude: /node_modules/,
      use: ['raw-loader'],
    });

    return config;
  },
};

module.exports = nextConfig;
