/**
 * Sculptures Gallery Page - Muestra todas las esculturas con filtros y búsqueda
 */
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Search,
  Filter,
  Loader2,
  Eye,
  Calendar,
  User,
  Cpu,
  CheckCircle,
  XCircle,
  Upload as UploadIcon,
} from 'lucide-react';

const SculpturesGalleryPage = () => {
  const router = useRouter();
  const [sculptures, setSculptures] = useState([]);
  const [filteredSculptures, setFilteredSculptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchSculptures();
  }, []);

  const fetchSculptures = async () => {
    try {
      const response = await sculptureService.getAll();
      if (response.success) {
        setSculptures(response.data);
        setFilteredSculptures(response.data);

        // Extraer categorías únicas
        const uniqueCategories = [
          ...new Set(response.data.map((s) => s.categoria)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error al cargar esculturas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar esculturas
  useEffect(() => {
    let filtered = sculptures;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (sculpture) =>
          sculpture.nombre_escultura
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sculpture.artista.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sculpture.descripcion_escultura
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (sculpture) => sculpture.categoria === selectedCategory
      );
    }

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(
        (sculpture) => sculpture.processing_status === selectedStatus
      );
    }

    setFilteredSculptures(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, sculptures]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Listo
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            Procesando
          </Badge>
        );
      case 'uploading':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <UploadIcon className="h-3 w-3" />
            Subiendo
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-nature-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">Cargando galería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
            Galería de Esculturas 3D
          </h1>
          <p className="text-slate-600">
            Explora esculturas en realidad aumentada
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="mb-8 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, artista o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4">
            {/* Filtro por categoría */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completado</option>
                <option value="processing">Procesando</option>
                <option value="uploading">Subiendo</option>
                <option value="failed">Error</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>

          {/* Contador de resultados */}
          <p className="text-sm text-slate-600">
            Mostrando {filteredSculptures.length} de {sculptures.length} esculturas
          </p>
        </div>

        {/* Grid de Esculturas */}
        {filteredSculptures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600 mb-4">
              No se encontraron esculturas
            </p>
            <Button onClick={() => router.push('/upload-sculpture')}>
              Subir Nueva Escultura
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSculptures.map((sculpture) => (
              <Card
                key={sculpture.id}
                className="group hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                onClick={() => router.push(`/sculpture/${sculpture.id}`)}
              >
                {/* Imagen de preview */}
                <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  {sculpture.images && sculpture.images[0] ? (
                    <img
                      src={sculpture.images[0]}
                      alt={sculpture.nombre_escultura}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Cpu className="h-16 w-16 text-slate-400" />
                    </div>
                  )}

                  {/* Overlay con estado */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(sculpture.processing_status)}
                  </div>

                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>

                  {/* Progreso si está procesando */}
                  {(sculpture.processing_status === 'processing' ||
                    sculpture.processing_status === 'uploading') && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                      <div
                        className="h-full bg-nature-600 transition-all duration-300"
                        style={{ width: `${sculpture.processing_progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Información */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-1">
                    {sculpture.nombre_escultura}
                  </h3>

                  <p className="text-sm text-slate-600 flex items-center gap-1 mb-2">
                    <User className="h-4 w-4" />
                    {sculpture.artista}
                  </p>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {sculpture.descripcion_escultura}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(sculpture.fecha).getFullYear()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {sculpture.categoria}
                    </Badge>
                  </div>

                  {/* Etiquetas */}
                  {sculpture.etiqueta && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sculpture.etiqueta
                        .split(', ')
                        .slice(0, 3)
                        .map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag.trim()}
                          </Badge>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Botón de acción flotante */}
        <div className="fixed bottom-8 right-8">
          <Button
            size="lg"
            className="rounded-full shadow-lg"
            onClick={() => router.push('/upload-sculpture')}
          >
            <UploadIcon className="h-5 w-5 mr-2" />
            Subir Escultura
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SculpturesGalleryPage;
