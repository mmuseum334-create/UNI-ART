/**
 * ImagePreviewGrid - Componente para mostrar preview de múltiples imágenes
 * con funcionalidad de drag & drop, eliminación y reordenamiento
 */
'use client'

import { useState } from 'react';
import { X, ZoomIn, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ImagePreviewGrid = ({ images, onRemove, onReorder, maxImages = 50, minImages = 10 }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Cerrar modal de zoom
  const closeZoom = () => {
    setSelectedImage(null);
  };

  // Manejo de drag & drop para reordenamiento
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    // Reordenar las imágenes
    if (onReorder) {
      onReorder(draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        {/* Contador de imágenes */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">
            {images.length} / {maxImages} imágenes
          </p>
          {images.length < minImages && (
            <p className="text-xs text-amber-600">
              Se requieren al menos {minImages} imágenes
            </p>
          )}
          {images.length >= minImages && images.length <= maxImages && (
            <p className="text-xs text-green-600">
              ✓ Cantidad correcta de imágenes
            </p>
          )}
          {images.length > maxImages && (
            <p className="text-xs text-red-600">
              ⚠ Máximo {maxImages} imágenes permitidas
            </p>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              images.length < minImages
                ? 'bg-amber-500'
                : images.length > maxImages
                ? 'bg-red-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((images.length / maxImages) * 100, 100)}%` }}
          ></div>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id || `img-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                draggedIndex === index
                  ? 'border-nature-500 opacity-50 scale-95'
                  : 'border-slate-200 hover:border-nature-400'
              }`}
            >
              {/* Imagen */}
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading image:', image);
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                }}
              />

              {/* Overlay con controles */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-1">
                {/* Botón de eliminar */}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg"
                  title="Eliminar imagen"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Botón de zoom */}
                <button
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-900 text-white rounded-full p-1.5 shadow-lg"
                  title="Ver imagen completa"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              {/* Indicador de drag */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white rounded p-1">
                <GripVertical className="h-3 w-3" />
              </div>

              {/* Número de imagen */}
              <div className="absolute bottom-1 left-1 bg-slate-800 bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Instrucciones */}
        <p className="text-xs text-slate-500 text-center">
          Arrastra las imágenes para reordenarlas. Haz clic en el ícono de zoom para ver en tamaño completo.
        </p>
      </div>

      {/* Modal de zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeZoom}
        >
          <div className="relative max-w-5xl max-h-full">
            <img
              src={selectedImage.preview}
              alt="Vista ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeZoom}
              className="absolute top-4 right-4 bg-white hover:bg-slate-100 text-slate-800 rounded-full p-2 shadow-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreviewGrid;
