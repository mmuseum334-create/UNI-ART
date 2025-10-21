/**
 * EditPaintingModal - Modal component for editing existing paintings
 * Allows users to update painting information and image
 */
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { artCategories } from '@/data/mockData';
import { paintService } from '@/services/paint/paintService';
import {
  X,
  Plus,
  Save,
  Upload as UploadIcon,
  FileText,
  Music,
  Video,
  Image as ImageIcon
} from 'lucide-react';

const EditPaintingModal = ({ painting, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    artista: '',
    nombre_pintura: '',
    img_pintura: null,
    descripcion_pintura: '',
    fecha: '',
    categoria: '',
    tecnicas: '',
    etiqueta: '',
    publicado_por: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [techniqueInput, setTechniqueInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Cargar datos de la pintura cuando se abre el modal
  useEffect(() => {
    if (painting && isOpen) {
      // Mapear los datos de diferentes fuentes posibles
      const artista = painting.artista || '';
      const nombrePintura = painting.nombre_pintura || painting.nombre || '';
      const descripcion = painting.descripcion_pintura || painting.description || '';
      const fecha = painting.fecha ? painting.fecha.split('T')[0] :
                    (painting.fechaCreacion ? new Date(painting.fechaCreacion).toISOString().split('T')[0] :
                    (painting.createdAt ? new Date(painting.createdAt).toISOString().split('T')[0] : ''));
      const categoria = painting.categoria || painting.category || '';
      const tecnicas = painting.tecnicas || '';
      const etiqueta = painting.etiqueta || '';
      const publicadoPor = painting.publicado_por || '';

      setFormData({
        artista,
        nombre_pintura: nombrePintura,
        img_pintura: null, // No cargamos el archivo original, solo el preview
        descripcion_pintura: descripcion,
        fecha,
        categoria,
        tecnicas,
        etiqueta,
        publicado_por: publicadoPor
      });

      // Establecer preview de la imagen actual desde diferentes fuentes posibles
      const imagenUrl = painting.img_pintura || painting.imagen || painting.imageUrl || painting.thumbnailUrl;
      setImagePreview(imagenUrl);
    }
  }, [painting, isOpen]);

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

      setFormData(prev => ({
        ...prev,
        img_pintura: file
      }));

      // Crear preview usando URL.createObjectURL
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));

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

  const validateForm = () => {
    const newErrors = {};

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
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    if (!formData.tecnicas.trim()) {
      newErrors.tecnicas = 'Debes agregar al menos una técnica';
    }
    if (!formData.etiqueta.trim()) {
      newErrors.etiqueta = 'Debes agregar al menos una etiqueta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Si hay una nueva imagen, enviar FormData, sino enviar JSON
      let updateData;

      if (formData.img_pintura) {
        // Nueva imagen: usar FormData
        updateData = new FormData();
        updateData.append('artista', formData.artista);
        updateData.append('nombre_pintura', formData.nombre_pintura);
        updateData.append('imagen', formData.img_pintura);
        updateData.append('descripcion_pintura', formData.descripcion_pintura);
        updateData.append('fecha', formData.fecha);
        updateData.append('categoria', formData.categoria);
        updateData.append('tecnicas', formData.tecnicas);
        updateData.append('etiqueta', formData.etiqueta);
        if (formData.publicado_por) {
          updateData.append('publicado_por', formData.publicado_por);
        }
      } else {
        // Sin nueva imagen: usar JSON
        updateData = {
          artista: formData.artista,
          nombre_pintura: formData.nombre_pintura,
          descripcion_pintura: formData.descripcion_pintura,
          fecha: formData.fecha,
          categoria: formData.categoria,
          tecnicas: formData.tecnicas,
          etiqueta: formData.etiqueta,
        };
        if (formData.publicado_por) {
          updateData.publicado_por = formData.publicado_por;
        }
      }

      const response = await paintService.update(painting.id, updateData);

      if (response.success) {
        // Limpiar preview URL si es blob
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }

        // Llamar callback de éxito
        if (onSave) {
          onSave(response.data);
        }

        // Cerrar modal
        onClose();
      } else {
        setErrors({
          submit: response.error || 'Error al actualizar la pintura. Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error al actualizar pintura:', error);
      setErrors({
        submit: 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Limpiar preview si es blob
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setErrors({});
    onClose();
  };

  const getTags = () => {
    return formData.etiqueta ? formData.etiqueta.split(', ').filter(tag => tag.trim()) : [];
  };

  const getTechniques = () => {
    return formData.tecnicas ? formData.tecnicas.split(', ').filter(tech => tech.trim()) : [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Editar Pintura
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Información Básica</h3>

            <div className="space-y-4">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      <p className="font-medium text-xs">{category.name}</p>
                    </button>
                  ))}
                </div>
                {errors.categoria && (
                  <p className="text-sm text-red-600 mt-1">{errors.categoria}</p>
                )}
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Imagen</h3>

            <div className="space-y-4">
              {imagePreview && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 mb-2">Imagen actual:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                </div>
              )}

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <UploadIcon className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-medium text-slate-900 mb-2">
                  Cambiar imagen (opcional)
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  Máximo 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="edit-file-upload"
                />
                <label
                  htmlFor="edit-file-upload"
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500 cursor-pointer transition-colors"
                >
                  Seleccionar Nueva Imagen
                </label>
                {errors.img_pintura && (
                  <p className="text-sm text-red-600 mt-2">{errors.img_pintura}</p>
                )}
              </div>
            </div>
          </div>

          {/* Detalles Técnicos */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalles Técnicos</h3>

            <div className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Etiquetas *
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Agregar etiqueta"
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
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaintingModal;
