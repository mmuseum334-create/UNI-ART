/**
 * Upload Selection Page - Permite elegir entre subir Pintura o Escultura
 * PROTEGIDO: Requiere autenticación y permisos de creación
 */
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Image as ImageIcon, Box } from 'lucide-react';

const UploadSelectionContent = () => {
  const { isAuthenticated } = useAuth();
  const { canCreate, RESOURCES } = usePermissions();
  const router = useRouter();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Perfil
          </Button>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
            Subir Nueva Obra
          </h1>
          <p className="text-slate-600">
            Selecciona el tipo de obra que deseas subir
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card
            className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-nature-500"
            onClick={() => router.push('/upload/painting')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Pintura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center mb-6">
                Sube una imagen de tu pintura o ilustración
              </p>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Una sola imagen</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Formato: JPG, PNG, WebP</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Tamaño máximo: 5MB</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Subida instantánea</span>
                </div>
              </div>

              <Button className="w-full mt-6 group-hover:bg-nature-600">
                Subir Pintura
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-nature-500"
            onClick={() => router.push('/upload/sculpture')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Box className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Escultura 3D</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center mb-6">
                Sube múltiples fotos para crear un modelo 3D con AR
              </p>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>10-50 fotografías</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Modelo 3D generado automáticamente</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Visualización en Realidad Aumentada</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">⏱</span>
                  <span>Procesamiento: 10-20 minutos</span>
                </div>
              </div>

              <Button className="w-full mt-6 group-hover:bg-nature-600">
                Subir Escultura
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                💡 ¿Qué tipo de obra elegir?
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Pintura:</strong> Ideal para obras 2D como cuadros, ilustraciones,
                  fotografías artísticas, dibujos, etc.
                </p>
                <p>
                  <strong>Escultura 3D:</strong> Perfecto para obras tridimensionales que quieras
                  visualizar en realidad aumentada. Requiere múltiples fotos desde diferentes ángulos
                  para crear el modelo 3D.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Exportar con protección de ruta
export default function UploadSelectionPage() {
  return (
    <ProtectedRoute requireAuth redirectTo="/auth">
      <UploadSelectionContent />
    </ProtectedRoute>
  );
}
