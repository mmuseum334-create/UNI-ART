/**
 * @fileoverview Página de catálogo de obras de arte
 * @description Muestra el catálogo completo de obras disponibles
 * Ruta: /catalog
 */

'use client';

import { Suspense } from 'react';
import Catalog from '@/views/Catalog';

/**
 * CatalogPage - Página del catálogo de arte
 */
export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Cargando catálogo...</p></div>}>
      <Catalog />
    </Suspense>
  );
}
