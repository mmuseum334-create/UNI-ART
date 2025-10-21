/**
 * Upload page - Allows users to upload and publish new artworks
 * Multi-step form for artwork information, content, and metadata
 */
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { artCategories } from '@/data/mockData';
import { paintService } from '@/services/paint/paintService';
import {
  Upload as UploadIcon,
  X,
  Plus,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  ArrowLeft,
  Save
} from 'lucide-react';

const Upload = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    artista: '',
    nombre_pintura: '',
    img_pintura: null, // Archivo File object
    descripcion_pintura: '',
    fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    categoria: '',
    tecnicas: '',
    etiqueta: '',
    publicado_por: user?.name || user?.email || ''
  });
  const [tagInput, setTagInput] = useState('');
  const [techniqueInput, setTechniqueInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Redirigir si no está autenticado (solo en el cliente)
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  // Mostrar loading durante SSR o mientras redirige
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          img_pintura: 'Solo se permiten archivos de imagen'
        }));
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          img_pintura: 'La imagen no debe superar los 5MB'
        }));
        return;
      }

      // Guardar el archivo directamente
      setFormData(prev => ({
        ...prev,
        img_pintura: file
      }));

      // Crear preview usando URL.createObjectURL
      setImagePreview(URL.createObjectURL(file));

      // Limpiar error si existía
      if (errors.img_pintura) {
        setErrors(prev => ({
          ...prev,
          img_pintura: ''
        }));
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = formData.etiqueta ? formData.etiqueta.split(', ') : [];
      if (!currentTags.includes(tagInput.trim())) {
        const newTags = [...currentTags, tagInput.trim()].join(', ');
        setFormData(prev => ({
          ...prev,
          etiqueta: newTags
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = formData.etiqueta ? formData.etiqueta.split(', ') : [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove).join(', ');
    setFormData(prev => ({
      ...prev,
      etiqueta: newTags
    }));
  };

  const addTechnique = () => {
    if (techniqueInput.trim()) {
      const currentTechniques = formData.tecnicas ? formData.tecnicas.split(', ') : [];
      if (!currentTechniques.includes(techniqueInput.trim())) {
        const newTechniques = [...currentTechniques, techniqueInput.trim()].join(', ');
        setFormData(prev => ({
          ...prev,
          tecnicas: newTechniques
        }));
        setTechniqueInput('');
      }
    }
  };

  const removeTechnique = (techniqueToRemove) => {
    const currentTechniques = formData.tecnicas ? formData.tecnicas.split(', ') : [];
    const newTechniques = currentTechniques.filter(technique => technique !== techniqueToRemove).join(', ');
    setFormData(prev => ({
      ...prev,
      tecnicas: newTechniques
    }));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.artista.trim()) {
        newErrors.artista = 'El nombre del artista es requerido';
      }
      if (!formData.nombre_pintura.trim()) {
        newErrors.nombre_pintura = 'El nombre de la pintura es requerido';
      }
      if (!formData.descripcion_pintura.trim()) {
        newErrors.descripcion_pintura = 'La descripción es requerida';
      }
      if (!formData.categoria) {
        newErrors.categoria = 'Selecciona una categoría';
      }
    }

    if (stepNumber === 2) {
      if (!formData.img_pintura) {
        newErrors.img_pintura = 'Debes subir una imagen de la pintura';
      }
      if (!formData.fecha) {
        newErrors.fecha = 'La fecha es requerida';
      }
      if (!formData.tecnicas.trim()) {
        newErrors.tecnicas = 'Debes agregar al menos una técnica';
      }
      if (!formData.etiqueta.trim()) {
        newErrors.etiqueta = 'Debes agregar al menos una etiqueta';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(2)) return;

    setIsSubmitting(true);

    try {
      // Preparar FormData para enviar al backend
      const paintFormData = new FormData();
      paintFormData.append('artista', formData.artista);
      paintFormData.append('nombre_pintura', formData.nombre_pintura);
      paintFormData.append('imagen', formData.img_pintura); // ✅ Cambiar a "imagen" (nombre que espera el backend)
      paintFormData.append('descripcion_pintura', formData.descripcion_pintura);
      paintFormData.append('fecha', formData.fecha);
      paintFormData.append('categoria', formData.categoria);
      paintFormData.append('tecnicas', formData.tecnicas);
      paintFormData.append('etiqueta', formData.etiqueta);
      paintFormData.append('publicado_por', formData.publicado_por);

      // Enviar al backend
      const response = await paintService.create(paintFormData);

      if (response.success) {
        // Limpiar preview URL para evitar memory leaks
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        // Redirigir al perfil en caso de éxito
        router.push('/profile');
      } else {
        setErrors({
          submit: response.error || 'Error al subir la pintura. Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error al subir pintura:', error);
      setErrors({
        submit: 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileUpload = () => {
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <UploadIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Sube la imagen de la pintura
          </h3>
          <p className="text-slate-600 mb-4">
            Arrastra y suelta o haz clic para seleccionar (máximo 5MB)
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500 cursor-pointer transition-colors"
          >
            Seleccionar Imagen
          </label>
          {errors.img_pintura && (
            <p className="text-sm text-red-600 mt-2">{errors.img_pintura}</p>
          )}
        </div>

        {imagePreview && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900 mb-2">Vista previa:</p>
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
          </div>
        )}
      </div>
    );
  };

  // Obtener etiquetas como array para renderizado
  const getTags = () => {
    return formData.etiqueta ? formData.etiqueta.split(', ').filter(tag => tag.trim()) : [];
  };

  // Obtener técnicas como array para renderizado
  const getTechniques = () => {
    return formData.tecnicas ? formData.tecnicas.split(', ').filter(tech => tech.trim()) : [];
  };

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

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Subir Nueva Obra
          </h1>
          <p className="text-slate-600">
            Comparte tu arte con la comunidad del museo virtual
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-nature-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${
              step >= 2 ? 'bg-nature-600' : 'bg-slate-200'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-nature-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-slate-600">Información Básica</span>
            <span className="text-sm text-slate-600">Contenido y Detalles</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del Artista *
                  </label>
                  <Input
                    name="artista"
                    value={formData.artista}
                    onChange={handleInputChange}
                    placeholder="Nombre del artista"
                    className={errors.artista ? 'border-red-500' : ''}
                  />
                  {errors.artista && (
                    <p className="text-sm text-red-600 mt-1">{errors.artista}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de la Pintura *
                  </label>
                  <Input
                    name="nombre_pintura"
                    value={formData.nombre_pintura}
                    onChange={handleInputChange}
                    placeholder="Escribe el nombre de la pintura"
                    className={errors.nombre_pintura ? 'border-red-500' : ''}
                  />
                  {errors.nombre_pintura && (
                    <p className="text-sm text-red-600 mt-1">{errors.nombre_pintura}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Publicado por
                  </label>
                  <Input
                    name="publicado_por"
                    value={formData.publicado_por}
                    onChange={handleInputChange}
                    placeholder="Tu nombre o usuario"
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Este campo se autocompletará con tu información de usuario
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="descripcion_pintura"
                    value={formData.descripcion_pintura}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe la pintura, inspiración, contexto histórico..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent ${
                      errors.descripcion_pintura ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.descripcion_pintura && (
                    <p className="text-sm text-red-600 mt-1">{errors.descripcion_pintura}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {artCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, categoria: category.id }))}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.categoria === category.id
                            ? 'border-nature-500 bg-nature-50 text-nature-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-2`}>
                          {category.icon && (
                            category.icon === 'FileText' ? <FileText className="h-4 w-4 text-white" /> :
                            category.icon === 'Music' ? <Music className="h-4 w-4 text-white" /> :
                            category.icon === 'Video' ? <Video className="h-4 w-4 text-white" /> :
                            <ImageIcon className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-slate-600">{category.description}</p>
                      </button>
                    ))}
                  </div>
                  {errors.categoria && (
                    <p className="text-sm text-red-600 mt-1">{errors.categoria}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Etiquetas *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Agregar etiqueta (ej: arte moderno, abstracto)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getTags().map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.etiqueta && (
                    <p className="text-sm text-red-600 mt-1">{errors.etiqueta}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={handleNext}>
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Imagen y Detalles Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderFileUpload()}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Creación *
                  </label>
                  <Input
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.fecha ? 'border-red-500' : ''}
                  />
                  {errors.fecha && (
                    <p className="text-sm text-red-600 mt-1">{errors.fecha}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Fecha en que se creó la pintura
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Técnicas Utilizadas *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={techniqueInput}
                      onChange={(e) => setTechniqueInput(e.target.value)}
                      placeholder="Ej: Óleo sobre lienzo, Acuarela"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnique())}
                    />
                    <Button type="button" onClick={addTechnique} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getTechniques().map((technique) => (
                      <Badge key={technique} variant="outline" className="flex items-center gap-1">
                        {technique}
                        <button
                          type="button"
                          onClick={() => removeTechnique(technique)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.tecnicas && (
                    <p className="text-sm text-red-600 mt-1">{errors.tecnicas}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Anterior
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Subiendo...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Publicar Obra
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default Upload;