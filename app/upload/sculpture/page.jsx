/**
 * UploadSculpture page - Permite subir esculturas con múltiples imágenes para generar modelos 3D
 * Formulario multi-paso para información de escultura y carga de 10-50 fotos
 */
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { artCategories } from '@/data/mockData';
import { sculptureService } from '@/services/sculpture/sculptureService';
import ImagePreviewGrid from '@/components/sculpture/ImagePreviewGrid';
import {
  Upload as UploadIcon,
  X,
  Plus,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react';

const UploadSculpture = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    artista: '',
    nombre_escultura: '',
    descripcion_escultura: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    tecnicas: '',
    etiqueta: '',
    publicado_por: user?.name || user?.email || '',
  });
  const [images, setImages] = useState([]); // Array de { file: File, preview: string }
  const [tagInput, setTagInput] = useState('');
  const [techniqueInput, setTechniqueInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const MIN_IMAGES = 10;
  const MAX_IMAGES = 50;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB por imagen

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  // Limpiar URLs de preview al desmontar
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Procesar archivos seleccionados
  const processFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const newErrors = {};

    fileArray.forEach((file, index) => {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        newErrors.images = 'Solo se permiten archivos de imagen';
        return;
      }

      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        newErrors.images = `La imagen "${file.name}" supera los 10MB`;
        return;
      }

      // Agregar a válidos con un ID único
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${file.size}-${Date.now()}-${index}`, // ID único para evitar problemas de re-render
      });
    });

    // Verificar límites usando callback de setState para tener el estado más reciente
    setImages((currentImages) => {
      const totalImages = currentImages.length + validFiles.length;

      if (totalImages > MAX_IMAGES) {
        newErrors.images = `Máximo ${MAX_IMAGES} imágenes. Tienes ${totalImages}`;
        setErrors(newErrors);
        // Revocar las URLs que no se van a usar
        validFiles.forEach(img => URL.revokeObjectURL(img.preview));
        return currentImages; // No agregar
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Revocar las URLs que no se van a usar
        validFiles.forEach(img => URL.revokeObjectURL(img.preview));
        return currentImages; // No agregar
      }

      // Limpiar error de imágenes
      setErrors((prev) => ({ ...prev, images: '' }));

      // Agregar las nuevas imágenes
      return [...currentImages, ...validFiles];
    });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  // Drag & Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  // Eliminar imagen
  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Reordenar imágenes
  const handleReorderImages = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = formData.etiqueta ? formData.etiqueta.split(', ') : [];
      if (!currentTags.includes(tagInput.trim())) {
        const newTags = [...currentTags, tagInput.trim()].join(', ');
        setFormData((prev) => ({
          ...prev,
          etiqueta: newTags,
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = formData.etiqueta ? formData.etiqueta.split(', ') : [];
    const newTags = currentTags.filter((tag) => tag !== tagToRemove).join(', ');
    setFormData((prev) => ({
      ...prev,
      etiqueta: newTags,
    }));
  };

  const addTechnique = () => {
    if (techniqueInput.trim()) {
      const currentTechniques = formData.tecnicas ? formData.tecnicas.split(', ') : [];
      if (!currentTechniques.includes(techniqueInput.trim())) {
        const newTechniques = [...currentTechniques, techniqueInput.trim()].join(', ');
        setFormData((prev) => ({
          ...prev,
          tecnicas: newTechniques,
        }));
        setTechniqueInput('');
      }
    }
  };

  const removeTechnique = (techniqueToRemove) => {
    const currentTechniques = formData.tecnicas ? formData.tecnicas.split(', ') : [];
    const newTechniques = currentTechniques
      .filter((technique) => technique !== techniqueToRemove)
      .join(', ');
    setFormData((prev) => ({
      ...prev,
      tecnicas: newTechniques,
    }));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.artista.trim()) {
        newErrors.artista = 'El nombre del artista es requerido';
      }
      if (!formData.nombre_escultura.trim()) {
        newErrors.nombre_escultura = 'El nombre de la escultura es requerido';
      }
      if (!formData.descripcion_escultura.trim()) {
        newErrors.descripcion_escultura = 'La descripción es requerida';
      }
      if (!formData.categoria) {
        newErrors.categoria = 'Selecciona una categoría';
      }
    }

    if (stepNumber === 2) {
      if (images.length < MIN_IMAGES) {
        newErrors.images = `Se requieren al menos ${MIN_IMAGES} imágenes. Tienes ${images.length}`;
      }
      if (images.length > MAX_IMAGES) {
        newErrors.images = `Máximo ${MAX_IMAGES} imágenes. Tienes ${images.length}`;
      }
    }

    if (stepNumber === 3) {
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

    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Preparar FormData
      const sculptureFormData = new FormData();
      sculptureFormData.append('artista', formData.artista);
      sculptureFormData.append('nombre_escultura', formData.nombre_escultura);
      sculptureFormData.append('descripcion_escultura', formData.descripcion_escultura);
      sculptureFormData.append('fecha', formData.fecha);
      sculptureFormData.append('categoria', formData.categoria);
      sculptureFormData.append('tecnicas', formData.tecnicas);
      sculptureFormData.append('etiqueta', formData.etiqueta);
      sculptureFormData.append('publicado_por', formData.publicado_por);

      // Agregar todas las imágenes
      console.log('Total de imágenes a enviar:', images.length);
      images.forEach((image, index) => {
        console.log(`Agregando imagen ${index + 1}:`, image.file.name, image.file.size, 'bytes');
        sculptureFormData.append('images', image.file);
      });

      // Verificar FormData
      console.log('Contenido del FormData:');
      for (let pair of sculptureFormData.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

      // Enviar al backend
      const response = await sculptureService.create(sculptureFormData);

      if (response.success) {
        // Limpiar previews
        images.forEach((img) => {
          if (img.preview) {
            URL.revokeObjectURL(img.preview);
          }
        });

        // Redirigir a página de estado de procesamiento
        router.push(`/sculpture/${response.data.id}/processing`);
      } else {
        // Mostrar error específico
        const errorMessage = response.error || 'Error al subir la escultura. Intenta nuevamente.';
        console.error('Error al crear escultura:', errorMessage);

        // Si es error de autenticación, redirigir al login
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
          setErrors({
            submit: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          });
          setTimeout(() => {
            router.push('/auth');
          }, 2000);
        } else {
          setErrors({
            submit: errorMessage,
          });
        }
      }
    } catch (error) {
      console.error('Error al subir escultura:', error);
      setErrors({
        submit: 'Error de conexión. Por favor, verifica tu conexión a internet.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileUpload = () => {
    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-nature-500 bg-nature-50'
              : images.length >= MIN_IMAGES && images.length <= MAX_IMAGES
              ? 'border-green-300 bg-green-50'
              : 'border-slate-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Sube las fotos de la escultura
          </h3>
          <p className="text-slate-600 mb-2">
            Arrastra y suelta o haz clic para seleccionar
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Se requieren entre {MIN_IMAGES} y {MAX_IMAGES} fotos (máximo 10MB cada una)
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload-sculpture"
            disabled={images.length >= MAX_IMAGES}
          />
          <label
            htmlFor="file-upload-sculpture"
            className={`inline-flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              images.length >= MAX_IMAGES
                ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500'
            }`}
          >
            Seleccionar Imágenes
          </label>
          {errors.images && <p className="text-sm text-red-600 mt-2">{errors.images}</p>}
        </div>

        {/* Preview Grid */}
        {images.length > 0 && (
          <ImagePreviewGrid
            images={images}
            onRemove={handleRemoveImage}
            onReorder={handleReorderImages}
            maxImages={MAX_IMAGES}
            minImages={MIN_IMAGES}
          />
        )}
      </div>
    );
  };

  const getTags = () => {
    return formData.etiqueta
      ? formData.etiqueta.split(', ').filter((tag) => tag.trim())
      : [];
  };

  const getTechniques = () => {
    return formData.tecnicas
      ? formData.tecnicas.split(', ').filter((tech) => tech.trim())
      : [];
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
            Subir Nueva Escultura
          </h1>
          <p className="text-slate-600">
            Sube fotos de tu escultura y generaremos un modelo 3D para realidad aumentada
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= stepNum ? 'bg-nature-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > stepNum ? 'bg-nature-600' : 'bg-slate-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-slate-600">Información Básica</span>
            <span className="text-sm text-slate-600">Fotografías</span>
            <span className="text-sm text-slate-600">Detalles</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Paso 1: Información Básica */}
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
                    Nombre de la Escultura *
                  </label>
                  <Input
                    name="nombre_escultura"
                    value={formData.nombre_escultura}
                    onChange={handleInputChange}
                    placeholder="Escribe el nombre de la escultura"
                    className={errors.nombre_escultura ? 'border-red-500' : ''}
                  />
                  {errors.nombre_escultura && (
                    <p className="text-sm text-red-600 mt-1">{errors.nombre_escultura}</p>
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
                    name="descripcion_escultura"
                    value={formData.descripcion_escultura}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe la escultura, inspiración, contexto histórico..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent ${
                      errors.descripcion_escultura ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.descripcion_escultura && (
                    <p className="text-sm text-red-600 mt-1">{errors.descripcion_escultura}</p>
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
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, categoria: category.id }))
                        }
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.categoria === category.id
                            ? 'border-nature-500 bg-nature-50 text-nature-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-2`}
                        >
                          {category.icon && (
                            <>
                              {category.icon === 'FileText' && (
                                <FileText className="h-4 w-4 text-white" />
                              )}
                              {category.icon === 'Music' && (
                                <Music className="h-4 w-4 text-white" />
                              )}
                              {category.icon === 'Video' && (
                                <Video className="h-4 w-4 text-white" />
                              )}
                              {category.icon === 'Image' && (
                                <ImageIcon className="h-4 w-4 text-white" />
                              )}
                            </>
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

                <div className="flex justify-end">
                  <Button type="button" onClick={handleNext}>
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paso 2: Fotografías */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Fotografías de la Escultura</CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  Para generar un modelo 3D de calidad, necesitamos entre {MIN_IMAGES} y{' '}
                  {MAX_IMAGES} fotografías de diferentes ángulos de la escultura.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderFileUpload()}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Consejos para mejores resultados:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Toma fotos desde todos los ángulos (360°)</li>
                    <li>Mantén buena iluminación uniforme</li>
                    <li>Evita sombras fuertes o reflejos</li>
                    <li>Asegúrate de que la escultura esté enfocada</li>
                    <li>Superpón al menos 50% entre fotos consecutivas</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={images.length < MIN_IMAGES || images.length > MAX_IMAGES}
                  >
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paso 3: Detalles y Metadatos */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles y Metadatos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  {errors.fecha && <p className="text-sm text-red-600 mt-1">{errors.fecha}</p>}
                  <p className="text-xs text-slate-500 mt-1">
                    Fecha en que se creó la escultura
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
                      placeholder="Ej: Mármol tallado, Bronce fundido"
                      onKeyPress={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addTechnique())
                      }
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Etiquetas *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Agregar etiqueta (ej: clásico, contemporáneo)"
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

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Una vez que subas las fotos, nuestro sistema generará
                    automáticamente un modelo 3D de tu escultura. Este proceso puede tomar varios
                    minutos. Serás redirigido a una página donde podrás ver el progreso.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Anterior
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Publicar Escultura
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

export default UploadSculpture;
