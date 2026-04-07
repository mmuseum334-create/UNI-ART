/**
 * Processing Page - Muestra el estado del procesamiento del modelo 3D
 * Con polling automático cada 5 segundos
 */
'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { sculptureService } from '@/services/sculpture/sculptureService';
import ProcessingStatus from '@/components/sculpture/ProcessingStatus';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Eye } from 'lucide-react';

const SculptureProcessingPage = () => {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const sculptureId = params?.id;

  const [sculpture, setSculpture] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de la escultura
  useEffect(() => {
    if (!sculptureId) return;

    const fetchSculpture = async () => {
      try {
        const response = await sculptureService.getById(sculptureId);
        if (response.success) {
          setSculpture(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Error al cargar la escultura');
      } finally {
        setLoading(false);
      }
    };

    fetchSculpture();
  }, [sculptureId]);

  // Polling para actualizar el estado
  useEffect(() => {
    if (!sculptureId) return;

    const fetchStatus = async () => {
      try {
        const response = await sculptureService.getProcessingStatus(sculptureId);
        if (response.success) {
          setProcessingStatus(response.data);

          // Si se completó, redirigir a la página de detalles después de 3 segundos
          if (response.data.status === 'completed') {
            setTimeout(() => {
              router.push(`/sculpture/${sculptureId}`);
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Error al obtener estado:', err);
      }
    };

    // Fetch inmediato
    fetchStatus();

    // Polling cada 5 segundos si está procesando
    const interval = setInterval(() => {
      if (processingStatus?.status === 'uploading' || processingStatus?.status === 'processing') {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sculptureId, processingStatus?.status, router]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/profile')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2 dark:text-white">
            {sculpture?.nombre_escultura || 'Procesando Escultura'}
          </h1>
          <p className="text-slate-600 dark:text-white/80">
            por {sculpture?.artista || 'Cargando...'}
          </p>
        </div>

        {/* Estado de Procesamiento */}
        {processingStatus && (
          <div className="mb-8">
            <ProcessingStatus
              status={processingStatus.status}
              progress={processingStatus.progress}
              errorMessage={processingStatus.error_message}
            />
          </div>
        )}

        {/* Información de la escultura */}
        {sculpture && (
          <Card>
            <CardHeader>
              <CardTitle>Información de la Escultura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Descripción</h3>
                <p className="text-sm text-slate-600">{sculpture.descripcion_escultura}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Categoría</h3>
                  <p className="text-sm text-slate-600">{sculpture.categoria}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Fecha</h3>
                  <p className="text-sm text-slate-600">
                    {new Date(sculpture.fecha).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Técnicas</h3>
                <p className="text-sm text-slate-600">{sculpture.tecnicas}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Imágenes cargadas</h3>
                <p className="text-sm text-slate-600">{sculpture.images?.length || 0} fotografías</p>
              </div>

              {/* Galería de miniaturas */}
              {sculpture.images && sculpture.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">
                    Vista previa de fotografías
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {sculpture.images.slice(0, 12).map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden border border-slate-200"
                      >
                        <img
                          src={imageUrl}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {sculpture.images.length > 12 && (
                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        <span className="text-xs text-slate-600">
                          +{sculpture.images.length - 12}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {processingStatus?.status === 'completed' && (
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    onClick={() => router.push(`/sculpture/${sculptureId}`)}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Modelo 3D
                  </Button>
                </div>
              )}

              {processingStatus?.status === 'failed' && (
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    onClick={() => router.push(`/sculpture/${sculptureId}/edit`)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Reintentar con nuevas fotos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* FAQ / Información adicional */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                ¿Cuánto tiempo tarda el procesamiento?
              </h3>
              <p className="text-sm text-slate-600">
                El tiempo de procesamiento varía dependiendo del número de imágenes y su calidad.
                Generalmente toma entre 10 y 20 minutos.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                ¿Puedo cerrar esta página?
              </h3>
              <p className="text-sm text-slate-600">
                Sí, el procesamiento continúa en nuestros servidores. Puedes volver más tarde
                para ver el resultado.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                ¿Qué hago si el procesamiento falla?
              </h3>
              <p className="text-sm text-slate-600">
                Si el procesamiento falla, verifica que las fotos sean de buena calidad, con
                buena iluminación y que cubran todos los ángulos de la escultura. Luego puedes
                intentar nuevamente con fotos mejoradas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SculptureProcessingPage;
