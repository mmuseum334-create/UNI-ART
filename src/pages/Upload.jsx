import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { artCategories } from '../data/mockData';
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
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    content: '',
    file: null,
    lyrics: '',
    techniques: [],
    dimensions: '',
    year: new Date().getFullYear(),
    materials: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [techniqueInput, setTechniqueInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    navigate('/auth');
    return null;
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
      setFormData(prev => ({
        ...prev,
        file
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTechnique = () => {
    if (techniqueInput.trim() && !formData.techniques.includes(techniqueInput.trim())) {
      setFormData(prev => ({
        ...prev,
        techniques: [...prev.techniques, techniqueInput.trim()]
      }));
      setTechniqueInput('');
    }
  };

  const removeTechnique = (techniqueToRemove) => {
    setFormData(prev => ({
      ...prev,
      techniques: prev.techniques.filter(technique => technique !== techniqueToRemove)
    }));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'El título es requerido';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
      }
      if (!formData.category) {
        newErrors.category = 'Selecciona una categoría';
      }
    }

    if (stepNumber === 2) {
      if (formData.category === 'poems' && !formData.content.trim()) {
        newErrors.content = 'El contenido del poema es requerido';
      }
      if (formData.category === 'songs' && !formData.lyrics.trim()) {
        newErrors.lyrics = 'La letra de la canción es requerida';
      }
      if (['paintings', 'images', 'videos', 'sculptures', 'other'].includes(formData.category) && !formData.file) {
        newErrors.file = 'Debes subir un archivo';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Obra subida:', formData);
      
      navigate('/profile', { 
        state: { message: 'Obra subida exitosamente' }
      });
    } catch (error) {
      setErrors({ submit: 'Error al subir la obra. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileUpload = () => {
    const acceptedTypes = {
      paintings: 'image/*',
      images: 'image/*',
      videos: 'video/*',
      sculptures: 'image/*',
      songs: 'audio/*',
      other: '*'
    };

    return (
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
        <UploadIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Sube tu archivo
        </h3>
        <p className="text-slate-600 mb-4">
          Arrastra y suelta o haz clic para seleccionar
        </p>
        <input
          type="file"
          accept={acceptedTypes[formData.category]}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="cursor-pointer">
            Seleccionar Archivo
          </Button>
        </label>
        {formData.file && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900">{formData.file.name}</p>
            <p className="text-xs text-slate-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>
    );
  };

  const renderContentField = () => {
    switch (formData.category) {
      case 'poems':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contenido del Poema *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={10}
              placeholder="Escribe tu poema aquí..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent font-serif"
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">{errors.content}</p>
            )}
          </div>
        );

      case 'songs':
        return (
          <div className="space-y-4">
            {renderFileUpload()}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Letra de la Canción *
              </label>
              <textarea
                name="lyrics"
                value={formData.lyrics}
                onChange={handleInputChange}
                rows={8}
                placeholder="Escribe la letra de tu canción..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
              />
              {errors.lyrics && (
                <p className="text-sm text-red-600 mt-1">{errors.lyrics}</p>
              )}
            </div>
          </div>
        );

      default:
        return renderFileUpload();
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
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
                    Título de la Obra *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Escribe el título de tu obra"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe tu obra, inspiración, técnica utilizada..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
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
                        onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.category === category.id
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
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Etiquetas
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
                    {formData.tags.map((tag) => (
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
                <CardTitle>Contenido y Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderContentField()}
                {errors.file && (
                  <p className="text-sm text-red-600">{errors.file}</p>
                )}

                {(formData.category === 'paintings' || formData.category === 'sculptures') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Técnicas Utilizadas
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={techniqueInput}
                          onChange={(e) => setTechniqueInput(e.target.value)}
                          placeholder="Ej: Óleo sobre lienzo"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnique())}
                        />
                        <Button type="button" onClick={addTechnique} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.techniques.map((technique) => (
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Dimensiones
                        </label>
                        <Input
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleInputChange}
                          placeholder="Ej: 60x80 cm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Año
                        </label>
                        <Input
                          name="year"
                          type="number"
                          value={formData.year}
                          onChange={handleInputChange}
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>

                    {formData.category === 'sculptures' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Materiales
                        </label>
                        <Input
                          name="materials"
                          value={formData.materials}
                          onChange={handleInputChange}
                          placeholder="Ej: Bronce patinado, Mármol"
                        />
                      </div>
                    )}
                  </>
                )}

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