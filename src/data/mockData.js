export const mockArtworks = [
  {
    id: '1',
    title: 'Atardecer en la Montaña',
    artist: 'María González',
    artistId: '1',
    category: 'paintings',
    description: 'Una hermosa representación del atardecer en las montañas andinas, capturando la serenidad y majestuosidad del paisaje.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    tags: ['paisaje', 'montañas', 'naturaleza', 'atardecer'],
    likes: 127,
    views: 1204,
    createdAt: '2024-01-15T10:30:00Z',
    isLiked: false,
    techniques: ['Óleo sobre lienzo', 'Espátula'],
    dimensions: '60x80 cm',
    year: 2024
  },
  {
    id: '2',
    title: 'Susurros del Alma',
    artist: 'Carlos Mendoza',
    artistId: '2',
    category: 'poems',
    description: 'Un poema que explora las profundidades del corazón humano y los sentimientos más íntimos.',
    content: `En el silencio de la noche estrellada,
donde los sueños danzan sin cesar,
mi alma susurra palabras olvidadas
que solo el viento puede escuchar.

Cada verso es un latido,
cada rima un suspiro,
que se pierde en el olvido
como lágrima en el río.`,
    tags: ['alma', 'sentimientos', 'noche', 'introspección'],
    likes: 89,
    views: 542,
    createdAt: '2024-01-14T15:45:00Z',
    isLiked: true,
    style: 'Lírico contemporáneo',
    length: 'Soneto'
  },
  {
    id: '3',
    title: 'Melodía de Primavera',
    artist: 'Ana Rodríguez',
    artistId: '3',
    category: 'songs',
    description: 'Una canción alegre que celebra la llegada de la primavera y el renacimiento de la naturaleza.',
    audioUrl: 'https://example.com/audio/primavera.mp3',
    lyrics: `Llega la primavera con su manto de colores,
las flores despiertan de su largo sueño,
el sol acaricia con sus rayos de oro
cada pétalo que nace en este ensueño.

[Coro]
Canta conmigo esta melodía,
que la primavera nos envía,
con alegría y esperanza,
la vida siempre avanza.`,
    tags: ['primavera', 'naturaleza', 'alegría', 'esperanza'],
    likes: 156,
    views: 2341,
    createdAt: '2024-01-13T09:20:00Z',
    isLiked: false,
    genre: 'Folk contemporáneo',
    duration: '3:45',
    instruments: ['Guitarra acústica', 'Violín', 'Flauta']
  },
  {
    id: '4',
    title: 'Reflexiones Urbanas',
    artist: 'David Torres',
    artistId: '4',
    category: 'videos',
    description: 'Un cortometraje que explora la vida en la ciudad moderna y las conexiones humanas en el siglo XXI.',
    videoUrl: 'https://example.com/video/reflexiones.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    tags: ['ciudad', 'modernidad', 'conexiones', 'sociedad'],
    likes: 203,
    views: 3456,
    createdAt: '2024-01-12T18:30:00Z',
    isLiked: true,
    duration: '8:30',
    format: 'Cortometraje',
    technique: 'Filmación digital'
  },
  {
    id: '5',
    title: 'Momento Eterno',
    artist: 'Laura Jiménez',
    artistId: '5',
    category: 'images',
    description: 'Una fotografía en blanco y negro que captura un momento íntimo y emocional.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616c96f4131?w=800',
    tags: ['retrato', 'blanco y negro', 'emoción', 'intimidad'],
    likes: 94,
    views: 876,
    createdAt: '2024-01-11T14:15:00Z',
    isLiked: false,
    camera: 'Canon EOS R5',
    settings: 'f/2.8, 1/125s, ISO 400',
    technique: 'Fotografía analógica'
  },
  {
    id: '6',
    title: 'Libertad',
    artist: 'Roberto Silva',
    artistId: '6',
    category: 'sculptures',
    description: 'Una escultura abstracta que representa la libertad del espíritu humano.',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    tags: ['abstracto', 'libertad', 'espíritu', 'bronze'],
    likes: 112,
    views: 1567,
    createdAt: '2024-01-10T11:00:00Z',
    isLiked: false,
    material: 'Bronce patinado',
    dimensions: '180x60x40 cm',
    weight: '45 kg',
    technique: 'Fundición a la cera perdida'
  },
  {
    id: '7',
    title: 'Instalación Digital',
    artist: 'Elena Vargas',
    artistId: '7',
    category: 'other',
    description: 'Una instalación interactiva que combina arte digital con elementos físicos.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
    tags: ['digital', 'interactivo', 'tecnología', 'multimedia'],
    likes: 178,
    views: 2103,
    createdAt: '2024-01-09T16:45:00Z',
    isLiked: true,
    medium: 'Arte digital interactivo',
    technology: 'Proyección mapping, sensores de movimiento',
    dimensions: '300x400x200 cm'
  },
  {
    id: '8',
    title: 'Ciudad de Ensueño',
    artist: 'Miguel Herrera',
    artistId: '8',
    category: 'paintings',
    description: 'Una vista fantástica de una ciudad flotante entre nubes doradas.',
    imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
    tags: ['fantasía', 'ciudad', 'nubes', 'dorado'],
    likes: 145,
    views: 1890,
    createdAt: '2024-01-08T13:20:00Z',
    isLiked: false,
    techniques: ['Acrílico', 'Técnica mixta'],
    dimensions: '100x150 cm',
    year: 2024
  }
];

export const artCategories = [
  {
    id: 'paintings',
    name: 'Pinturas',
    icon: 'Palette',
    description: 'Colores y formas en lienzo',
    color: 'from-yellow-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400'
  },
  {
    id: 'sculptures',
    name: 'Esculturas',
    icon: 'Box',
    description: 'Formas tridimensionales',
    color: 'from-gray-500 to-slate-700',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
  },
  {
    id: 'poems',
    name: 'Poesía',
    icon: 'FileText',
    description: 'Versos que tocan el alma',
    color: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400'
  },
  {
    id: 'songs',
    name: 'Música',
    icon: 'Music',
    description: 'Melodías que inspiran',
    color: 'from-blue-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400'
  },
  {
    id: 'videos',
    name: 'Videos',
    icon: 'Video',
    description: 'Historias en movimiento',
    color: 'from-red-500 to-orange-500',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400'
  },
  {
    id: 'images',
    name: 'Fotografía',
    icon: 'Camera',
    description: 'Momentos capturados',
    color: 'from-green-500 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400'
  },
  {
    id: 'other',
    name: 'Arte Digital',
    icon: 'Sparkles',
    description: 'Creaciones del futuro',
    color: 'from-indigo-500 to-violet-500',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'
  }
];

export const featuredArtworks = mockArtworks.slice(0, 6);

export const getArtworksByCategory = (category) => {
  if (!category || category === 'all') return mockArtworks;
  return mockArtworks.filter(artwork => artwork.category === category);
};

export const searchArtworks = (query, category = 'all') => {
  const artworks = getArtworksByCategory(category);
  if (!query) return artworks;
  
  const searchTerm = query.toLowerCase();
  return artworks.filter(artwork => 
    artwork.title.toLowerCase().includes(searchTerm) ||
    artwork.artist.toLowerCase().includes(searchTerm) ||
    artwork.description.toLowerCase().includes(searchTerm) ||
    artwork.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};