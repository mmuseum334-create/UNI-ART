/**
 * Configuración de modelos 3D para Realidad Aumentada
 * Centraliza todos los modelos disponibles en el museo
 */

export const arModels = [
  // Esculturas
  {
    id: 1,
    title: 'Escultura Digital - Astronauta',
    description: 'Una escultura interactiva que cobra vida en 3D. Explora cada detalle del traje espacial.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    artist: 'Roberto Silva',
    category: 'sculptures',
    type: '3d-model',
    tags: ['escultura', '3d', 'futurista']
  },

  // Pinturas y Cuadros
  {
    id: 2,
    title: 'Pintura Clásica - Casco Dañado',
    description: 'Una obra maestra que experimenta el paso del tiempo. Observa las texturas realistas en AR.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
    artist: 'María González',
    category: 'paintings',
    type: '3d-model',
    tags: ['pintura', 'vintage', 'textura']
  },

  {
    id: 3,
    title: 'Arte Abstracto 3D - Esfera Reflexiva',
    description: 'Formas abstractas que desafían la perspectiva. Interactúa con los reflejos en tiempo real.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/reflective-sphere.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=400',
    artist: 'Elena Vargas',
    category: 'sculptures',
    type: '3d-model',
    tags: ['abstracto', 'moderno', 'reflexivo']
  },

  // Más pinturas/cuadros con marcos 3D
  {
    id: 4,
    title: 'Cuadro Vintage con Marco Dorado',
    description: 'Un elegante marco dorado que enmarca una obra clásica. Perfecto para visualizar en tu pared.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/NormalTangentTest/glTF/NormalTangentTest.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=400',
    artist: 'Carlos Mendoza',
    category: 'paintings',
    type: '3d-model',
    tags: ['marco', 'clásico', 'dorado']
  },

  {
    id: 5,
    title: 'Paisaje Minimalista',
    description: 'Un cuadro minimalista con colores suaves. Visualízalo en cualquier espacio de tu hogar.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/BoxTextured/glTF/BoxTextured.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
    artist: 'Ana Rodríguez',
    category: 'paintings',
    type: '3d-model',
    tags: ['minimalista', 'paisaje', 'moderno']
  },

  {
    id: 6,
    title: 'Retrato Contemporáneo',
    description: 'Un retrato moderno con técnicas digitales. Observa los detalles de iluminación en 3D.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/MetalRoughSpheres/glTF/MetalRoughSpheres.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1578926078181-d5ca623f9de0?w=400',
    artist: 'Diego Fernández',
    category: 'paintings',
    type: '3d-model',
    tags: ['retrato', 'contemporáneo', 'digital']
  },

  {
    id: 7,
    title: 'Naturaleza Muerta en 3D',
    description: 'Una composición de objetos cotidianos elevada al arte tridimensional.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF/Lantern.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1582561381148-18b69db40a3f?w=400',
    artist: 'Laura Sánchez',
    category: 'paintings',
    type: '3d-model',
    tags: ['naturaleza muerta', 'objetos', 'realismo']
  },

  {
    id: 8,
    title: 'Arte Urbano Digital',
    description: 'Graffiti y arte callejero capturado en un modelo 3D interactivo.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/BoomBox/glTF/BoomBox.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400',
    artist: 'Miguel Torres',
    category: 'other',
    type: '3d-model',
    tags: ['urbano', 'graffiti', 'moderno']
  },

  {
    id: 9,
    title: 'Instalación Artística Flotante',
    description: 'Una instalación de arte conceptual que desafía la gravedad en realidad aumentada.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Avocado/glTF/Avocado.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400',
    artist: 'Patricia Ruiz',
    category: 'sculptures',
    type: '3d-model',
    tags: ['instalación', 'conceptual', 'flotante']
  }
];

/**
 * Obtiene un modelo por ID
 */
export const getModelById = (id) => {
  return arModels.find(model => model.id === id);
};

/**
 * Obtiene modelos por categoría
 */
export const getModelsByCategory = (category) => {
  return arModels.filter(model => model.category === category);
};

/**
 * Obtiene todos los modelos de pinturas/cuadros
 */
export const getPaintingModels = () => {
  return arModels.filter(model => model.category === 'paintings');
};

/**
 * Obtiene URL del modelo (maneja URLs locales y remotas)
 */
export const getModelUrl = (modelUrlOrId) => {
  // Si es un número, buscar por ID
  if (typeof modelUrlOrId === 'number') {
    const model = getModelById(modelUrlOrId);
    return model?.modelUrl || null;
  }

  // Si ya es una URL, devolverla
  return modelUrlOrId;
};

export default arModels;
