/**
 * Sculpture Detail Page - Muestra la información completa de una escultura y su modelo 3D en AR
 */
'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { sculptureService } from '@/services/sculpture/sculptureService';
import SculptureARViewer from '@/components/sculpture/SculptureARViewer';
import ProcessingStatus from '@/components/sculpture/ProcessingStatus';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Palette,
  Loader2,
  Share2,
  Heart,
} from 'lucide-react';
import { toast } from '@/lib/toast';

const SculptureDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const sculptureId = params?.id;

  const [sculpture, setSculpture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sculptureId) return;

    const fetchSculpture = async () => {
      try {
        const response = await sculptureService.getById(sculptureId);
        if (response.success) {
          setSculpture(response.data);

          // Si aún está procesando, redirigir a la página de procesamiento
          if (
            response.data.estado_procesamiento === 'procesando' ||
            response.data.estado_procesamiento === 'pendiente'
          ) {
            router.push(`/sculpture/${sculptureId}/processing`);
          }
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
  }, [sculptureId, router]);

  const handleShare = async () => {
    const shareData = {
      title: sculpture.nombre_escultura,
      text: `Mira esta escultura: ${sculpture.nombre_escultura} por ${sculpture.artista}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-nature-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">Cargando escultura...</p>
        </div>
      </div>
    );
  }

  if (error || !sculpture) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error || 'Escultura no encontrada'}</p>
            <Button onClick={() => router.push('/catalog')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Catálogo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProcessingFailed = sculpture.estado_procesamiento === 'fallido';
  const isCompleted = sculpture.estado_procesamiento === 'completado';

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/catalog')}
            className="flex items-center gap-2 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Catálogo
          </Button>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda: Modelo 3D o Estado */}
          <div>
            {isCompleted && sculpture.modelo_3d_url ? (
              <SculptureARViewer
                modelUrl={sculpture.modelo_3d_url}
                sculptureTitle={sculpture.nombre_escultura}
                posterUrl={sculpture.imagenes?.[0]}
              />
            ) : (
              <ProcessingStatus
                status={sculpture.estado_procesamiento === 'pendiente' ? 'uploading' : sculpture.estado_procesamiento === 'procesando' ? 'processing' : sculpture.estado_procesamiento === 'completado' ? 'completed' : 'failed'}
                progress={sculpture.progreso || 0}
                errorMessage={null}
              />
            )}

            {/* Galería de fotos originales */}
            {sculpture.imagenes && sculpture.imagenes.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Fotografías Originales</CardTitle>
                  <p className="text-sm text-slate-600">
                    {sculpture.imagenes.length} fotos usadas para generar el modelo 3D
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {sculpture.imagenes.slice(0, 8).map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:scale-105 transition-transform cursor-pointer"
                      >
                        <img
                          src={imageUrl}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {sculpture.imagenes.length > 8 && (
                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        <span className="text-sm text-slate-600 font-medium">
                          +{sculpture.imagenes.length - 8}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna derecha: Información */}
          <div className="space-y-6">
            {/* Título y acciones */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 mb-2 dark:text-white">
                    {sculpture.nombre_escultura}
                  </h1>
                  <p className="text-xl text-slate-600 flex items-center gap-2 dark:text-white/80">
                    <User className="h-5 w-5" />
                    {sculpture.artista}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-2 mt-4">
                <Badge
                  variant={
                    isCompleted ? 'success' : isProcessingFailed ? 'destructive' : 'default'
                  }
                >
                  {sculpture.estado_procesamiento === 'completado' && '✓ Modelo 3D Listo'}
                  {sculpture.estado_procesamiento === 'procesando' && '⏳ Procesando...'}
                  {sculpture.estado_procesamiento === 'pendiente' && '📤 Preparando...'}
                  {sculpture.estado_procesamiento === 'fallido' && '✗ Error'}
                </Badge>
                <Badge variant="outline">{sculpture.categoria}</Badge>
              </div>
            </div>

            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {sculpture.descripcion_escultura}
                </p>
              </CardContent>
            </Card>

            {/* Detalles */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Fecha de Creación</p>
                    <p className="text-sm text-slate-600">
                      {new Date(sculpture.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Palette className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Técnicas</p>
                    <p className="text-sm text-slate-600">{sculpture.tecnicas}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Etiquetas</p>
                    <div className="flex flex-wrap gap-2">
                      {sculpture.etiqueta.split(', ').map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          #{tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Publicado por</p>
                    <p className="text-sm text-slate-600">{sculpture.publicado_por}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadatos del modelo 3D */}
            {isCompleted && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">Modelo 3D Disponible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800">
                    Este modelo 3D fue generado mediante fotogrametría a partir de{' '}
                    {sculpture.imagenes?.length || 0} fotografías. Puedes visualizarlo en tu
                    dispositivo móvil usando realidad aumentada.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            {isProcessingFailed && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-amber-800 mb-4">
                    El procesamiento falló. Puedes intentar nuevamente con fotografías de mejor
                    calidad.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/sculpture/${sculptureId}/edit`)}>
                    Reintentar con nuevas fotos
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SculptureDetailPage;
