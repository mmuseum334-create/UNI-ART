/**
 * @fileoverview Página de detalle de obra de arte
 * @description Muestra información detallada de una obra específica
 * Ruta: /artwork/[id] (ruta dinámica)
 */

'use client';

import ArtworkDetail from '@/views/ArtworkDetail';

/**
 * ArtworkDetailPage - Página de detalle de obra
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.params - Parámetros de la ruta
 * @param {string} props.params.id - ID de la obra de arte
 */
export default function ArtworkDetailPage({ params }) {
  return <ArtworkDetail />;
}
