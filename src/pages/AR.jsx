import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import ARViewer from '../components/ar/ARViewer';
import {
  Box,
  Play,
  Square,
  RotateCcw,
  Maximize,
  Info,
  Smartphone,
  Chrome,
  AlertTriangle
} from 'lucide-react';

const AR = () => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar soporte para WebXR
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(isSupported);
        } catch (error) {
          console.log('AR no soportado:', error);
          setIsARSupported(false);
        }
      } else {
        setIsARSupported(false);
      }
      setIsLoading(false);
    };

    checkARSupport();
  }, []);

  const arArtworks = [
    {
      id: 1,
      title: 'Escultura Digital',
      description: 'Una escultura interactiva que cobra vida en 3D',
      modelUrl: '/models/sculpture.glb',
      thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      artist: 'Roberto Silva'
    },
    {
      id: 2,
      title: 'Pintura Flotante',
      description: 'Experimenta esta pintura en un entorno tridimensional',
      modelUrl: '/models/painting.glb',
      thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      artist: 'María González'
    },
    {
      id: 3,
      title: 'Arte Abstracto 3D',
      description: 'Formas abstractas que desafían la perspectiva',
      modelUrl: '/models/abstract.glb',
      thumbnail: 'https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=400',
      artist: 'Elena Vargas'
    }
  ];

  const startARSession = (artwork) => {
    setSelectedArtwork(artwork);
    setIsARActive(true);
  };

  const stopARSession = () => {
    setIsARActive(false);
    setSelectedArtwork(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nature-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Verificando compatibilidad AR...</p>
        </div>
      </div>
    );
  }

  if (isARActive && selectedArtwork) {
    return (
      <div className="min-h-screen">
        <ARViewer
          artwork={selectedArtwork}
          onExit={stopARSession}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary">
      {/* Header */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-nature-100 text-nature-800 dark:bg-nature-900 dark:text-nature-200 mb-4">
              <Box className="h-4 w-4 mr-2" />
              Realidad Aumentada
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gradient mb-6">
              Experimenta el Arte en
              <span className="text-gradient"> Realidad Aumentada</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Sumérgete en una experiencia única donde el arte cobra vida en tu entorno real.
              Interactúa con obras de arte tridimensionales usando la tecnología WebXR.
            </p>

            {!isARSupported && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-2" />
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    AR No Disponible
                  </h3>
                </div>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  La Realidad Aumentada no está disponible en tu dispositivo o navegador actual.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Usa un dispositivo móvil Android
                  </div>
                  <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <Chrome className="h-4 w-4 mr-2" />
                    Utiliza Chrome o Firefox
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Artworks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {arArtworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden card-hover">
                <div className="aspect-video relative">
                  <img
                    src={artwork.thumbnail}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="text-center text-white">
                      <Box className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm font-medium">Vista AR Disponible</p>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{artwork.title}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-300">por {artwork.artist}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {artwork.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startARSession(artwork)}
                      disabled={!isARSupported}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {isARSupported ? 'Iniciar AR' : 'AR No Disponible'}
                    </Button>
                    <Button variant="outline" className="px-3">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-16">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Cómo usar la Realidad Aumentada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="w-12 h-12 bg-nature-100 dark:bg-nature-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="h-6 w-6 text-nature-600 dark:text-nature-400" />
                    </div>
                    <h3 className="font-semibold mb-2">1. Prepara tu dispositivo</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Usa un dispositivo Android con soporte para ARCore y Chrome actualizado.
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-nature-100 dark:bg-nature-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-6 w-6 text-nature-600 dark:text-nature-400" />
                    </div>
                    <h3 className="font-semibold mb-2">2. Inicia la experiencia</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Selecciona una obra de arte y toca "Iniciar AR" para comenzar.
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-nature-100 dark:bg-nature-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Box className="h-6 w-6 text-nature-600 dark:text-nature-400" />
                    </div>
                    <h3 className="font-semibold mb-2">3. Interactúa</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Mueve tu dispositivo para ver la obra desde diferentes ángulos y toca para interactuar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AR;