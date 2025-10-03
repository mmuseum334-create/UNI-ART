'use client'

/**
 * ARViewer - Augmented Reality viewer for artworks using WebXR
 * Provides immersive AR experience with fallback to 3D preview mode
 * Supports mobile devices with touch optimization
 */
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  X,
  RotateCcw,
  Maximize,
  Volume2,
  VolumeX,
  Info
} from 'lucide-react';

const ARViewer = ({ artwork, onExit }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const sessionRef = useRef(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [showARButton, setShowARButton] = useState(false);

  // Configurar viewport para móviles
  useEffect(() => {
    // Configurar meta viewport para una mejor experiencia móvil
    const viewport = document.querySelector('meta[name="viewport"]');
    const originalContent = viewport?.getAttribute('content');

    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Prevenir zoom en iOS
    const preventZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });

    return () => {
      // Restaurar viewport original al desmontar
      if (viewport && originalContent) {
        viewport.setAttribute('content', originalContent);
      }
      document.removeEventListener('touchstart', preventZoom);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initPreviewMode = async (THREE) => {
      try {
        // Configurar escena 3D básica sin AR
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);
        sceneRef.current = scene;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          powerPreference: "high-performance"
        });

        // Optimizar para móviles en modo preview también
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2;

        // Crear la misma obra de arte pero para vista 3D
        const artworkGroup = new THREE.Group();

        const frameGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.05);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        artworkGroup.add(frame);

        // Canvas con color dinámico
        let canvasColor = 0xf0f0f0;
        if (artwork.artist.toLowerCase().includes('van gogh')) canvasColor = 0xffeb3b;
        else if (artwork.artist.toLowerCase().includes('picasso')) canvasColor = 0x2196f3;

        const canvasGeometry = new THREE.PlaneGeometry(0.5, 0.7);
        const canvasMaterial = new THREE.MeshStandardMaterial({ color: canvasColor });
        const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
        canvas.position.z = 0.026;
        artworkGroup.add(canvas);

        scene.add(artworkGroup);

        // Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Agregar al DOM
        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement);
        }

        // Loop de animación
        const animate = () => {
          requestAnimationFrame(animate);
          artworkGroup.rotation.y += 0.005;
          renderer.render(scene, camera);
        };
        animate();

        setIsLoading(false);
      } catch (err) {
        setError('Error en modo preview: ' + err.message);
        setIsLoading(false);
      }
    };

    const initAR = async () => {
      try {
        console.log('Iniciando verificación de AR...');

        // Verificar soporte de WebXR
        if (!navigator.xr) {
          console.log('WebXR no disponible');
          throw new Error('WebXR no está soportado en este dispositivo/navegador');
        }

        console.log('WebXR encontrado, verificando soporte de AR...');

        // Verificar soporte específico de AR
        const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
        console.log('Soporte de AR:', isARSupported);

        if (!isARSupported) {
          throw new Error('Realidad Aumentada no está soportada en este dispositivo');
        }

        console.log('AR soportado, continuando...');

        // Importar THREE.js dinámicamente
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { FontLoader } = await import('three/examples/jsm/loaders/FontLoader.js');
        const { XRButton } = await import('three/examples/jsm/webxr/XRButton.js');

        if (!isMounted) return;

        // Configurar la escena
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Configurar el renderer - Optimizado para móviles
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        });

        // Ajustar pixel ratio para rendimiento en móviles
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Optimizaciones para móviles
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        rendererRef.current = renderer;

        // Configurar la cámara
        const camera = new THREE.PerspectiveCamera(
          70,
          window.innerWidth / window.innerHeight,
          0.01,
          20
        );

        // Agregar luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Crear una representación 3D de la obra de arte
        const artworkGroup = new THREE.Group();

        // Marco de la obra
        const frameGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.05);
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: 0x8B4513,
          metalness: 0.2,
          roughness: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.castShadow = true;
        artworkGroup.add(frame);

        // "Lienzo" de la obra con colores representativos
        const canvasGeometry = new THREE.PlaneGeometry(0.5, 0.7);

        // Determinar color basado en el tipo de obra o artista
        let canvasColor = 0xf0f0f0; // Color por defecto
        if (artwork.artist.toLowerCase().includes('van gogh')) {
          canvasColor = 0xffeb3b; // Amarillo para Van Gogh
        } else if (artwork.artist.toLowerCase().includes('picasso')) {
          canvasColor = 0x2196f3; // Azul para Picasso
        } else if (artwork.title.toLowerCase().includes('noche')) {
          canvasColor = 0x1a237e; // Azul oscuro para temas nocturnos
        } else if (artwork.title.toLowerCase().includes('flores') || artwork.title.toLowerCase().includes('jardín')) {
          canvasColor = 0x4caf50; // Verde para temas de naturaleza
        }

        const canvasMaterial = new THREE.MeshStandardMaterial({
          color: canvasColor,
          side: THREE.DoubleSide,
          metalness: 0.1,
          roughness: 0.8
        });
        const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
        canvas.position.z = 0.026;
        artworkGroup.add(canvas);

        // Placa informativa
        const plaqueGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.02);
        const plaqueMaterial = new THREE.MeshStandardMaterial({
          color: 0x2c2c2c,
          metalness: 0.1,
          roughness: 0.9
        });
        const plaque = new THREE.Mesh(plaqueGeometry, plaqueMaterial);
        plaque.position.set(0, -0.5, 0.03);
        artworkGroup.add(plaque);

        // Posicionar el grupo
        artworkGroup.position.set(0, 0, -1);
        artworkGroup.castShadow = true;
        scene.add(artworkGroup);

        // Agregar texto flotante con información
        const textGroup = new THREE.Group();

        // Texto del título (simulado con geometría)
        const titleGeometry = new THREE.PlaneGeometry(0.5, 0.08);
        const titleMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9
        });
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(0, 0.6, -0.8);
        textGroup.add(titleMesh);

        // Texto del artista
        const artistGeometry = new THREE.PlaneGeometry(0.4, 0.06);
        const artistMaterial = new THREE.MeshBasicMaterial({
          color: 0xcccccc,
          transparent: true,
          opacity: 0.8
        });
        const artistMesh = new THREE.Mesh(artistGeometry, artistMaterial);
        artistMesh.position.set(0, 0.5, -0.8);
        textGroup.add(artistMesh);

        scene.add(textGroup);

        // Configurar controles de XR
        const controller = renderer.xr.getController(0);
        controller.addEventListener('select', () => {
          // Rotar la obra al hacer tap
          artworkGroup.rotation.y += Math.PI / 6;
          // Hacer que el texto "pulse"
          textGroup.scale.setScalar(1.1);
          setTimeout(() => {
            textGroup.scale.setScalar(1);
          }, 200);
        });
        scene.add(controller);

        // Agregar el renderer al DOM
        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement);
        }

        // Crear botón AR manual para mejor control
        const createARButton = () => {
          const button = document.createElement('button');
          button.textContent = 'ENTER AR';
          button.style.position = 'absolute';
          button.style.bottom = '20px';
          button.style.left = '50%';
          button.style.transform = 'translateX(-50%)';
          button.style.padding = '12px 24px';
          button.style.backgroundColor = '#007bff';
          button.style.border = 'none';
          button.style.borderRadius = '25px';
          button.style.color = 'white';
          button.style.fontSize = '16px';
          button.style.cursor = 'pointer';
          button.style.zIndex = '1000';
          button.style.fontWeight = 'bold';

          button.addEventListener('click', async () => {
            try {
              const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['dom-overlay', 'hit-test', 'anchors']
              });
              renderer.xr.setSession(session);
              button.style.display = 'none';
            } catch (error) {
              console.error('Error al iniciar AR:', error);
              alert('No se pudo iniciar AR. Asegúrate de estar en un dispositivo compatible.');
            }
          });

          return button;
        };

        const arButton = createARButton();
        if (containerRef.current) {
          containerRef.current.appendChild(arButton);
        }

        // Marcar que el botón AR está disponible
        setShowARButton(true);
        console.log('Botón AR creado y agregado al DOM');

        // Manejar eventos de sesión XR
        renderer.xr.addEventListener('sessionstart', () => {
          setIsSessionActive(true);
          sessionRef.current = renderer.xr.getSession();
          // Ocultar el botón cuando AR está activo
          if (arButton) {
            arButton.style.display = 'none';
          }
        });

        renderer.xr.addEventListener('sessionend', () => {
          setIsSessionActive(false);
          sessionRef.current = null;
          // Mostrar el botón cuando AR termina
          if (arButton) {
            arButton.style.display = 'block';
          }
        });

        // Loop de renderizado
        const animate = () => {
          renderer.setAnimationLoop(() => {
            // Animación sutil de flotación para la obra
            if (artworkGroup) {
              artworkGroup.position.y = Math.sin(Date.now() * 0.001) * 0.02;
              artworkGroup.rotation.x = Math.sin(Date.now() * 0.0005) * 0.05;
            }
            // Animación del texto
            if (textGroup) {
              textGroup.position.y = 0.5 + Math.sin(Date.now() * 0.002) * 0.01;
            }
            renderer.render(scene, camera);
          });
        };

        animate();
        setIsLoading(false);

        // Manejar resize para móviles (orientación, teclado virtual, etc.)
        const handleResize = () => {
          if (renderer && camera) {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('orientationchange', handleResize);
          if (renderer.domElement && containerRef.current) {
            containerRef.current.removeChild(renderer.domElement);
          }
          if (arButton && containerRef.current) {
            containerRef.current.removeChild(arButton);
          }
          renderer.dispose();
        };

      } catch (err) {
        console.error('Error inicializando AR:', err);

        // Si es un error de soporte, ofrecer modo preview
        if (err.message.includes('WebXR') || err.message.includes('Realidad Aumentada')) {
          console.log('AR no soportado, iniciando modo preview 3D');
          setPreviewMode(true);
          setError(null);
          await initPreviewMode(THREE);
        } else {
          setError(err.message);
        }
        setIsLoading(false);
      }
    };

    initAR();

    return () => {
      isMounted = false;
      if (sessionRef.current) {
        sessionRef.current.end();
      }
    };
  }, [artwork]);

  const handleExit = () => {
    if (sessionRef.current) {
      sessionRef.current.end();
    }
    onExit();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Cargando experiencia AR...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error de AR</h2>
          <p className="mb-6">No se pudo inicializar la experiencia de realidad aumentada.</p>
          <p className="text-sm text-gray-300 mb-6">{error}</p>
          <Button onClick={handleExit} variant="outline" className="text-white border-white">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Contenedor para el canvas AR */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* UI Overlay - Responsive */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3 sm:p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-white flex-1 max-w-xs sm:max-w-sm">
            <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 leading-tight">{artwork.title}</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">por {artwork.artist}</p>
            <p className="text-xs text-gray-400 line-clamp-3 sm:line-clamp-none">{artwork.description}</p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={handleExit}
              variant="outline"
              size="sm"
              className="bg-black/70 backdrop-blur-sm border-white/30 text-white hover:bg-black/90 min-h-[44px] min-w-[44px] p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions - Mobile Optimized */}
      {!isSessionActive && !previewMode && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white z-10 px-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-sm">
            <Info className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4 text-blue-400" />
            {showARButton ? (
              <>
                <p className="text-sm sm:text-base mb-2 font-medium">Toca "ENTER AR" para iniciar</p>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Mueve tu dispositivo para ver el objeto 3D y toca la pantalla para interactuar
                </p>
              </>
            ) : (
              <>
                <p className="text-sm sm:text-base mb-2 font-medium">Cargando experiencia AR...</p>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Preparando la realidad aumentada
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Botón manual si AR no se carga automáticamente */}
      {!isSessionActive && !previewMode && !showARButton && !isLoading && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            onClick={async () => {
              console.log('Intentando iniciar preview mode manualmente');
              setIsLoading(true);
              try {
                const THREE = await import('three');
                await initPreviewMode(THREE);
                setPreviewMode(true);
              } catch (err) {
                console.error('Error al iniciar modo preview:', err);
                setError('Error al cargar la vista 3D');
              }
              setIsLoading(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold"
          >
            Ver en 3D
          </Button>
        </div>
      )}

      {/* Preview Mode Instructions - Mobile Optimized */}
      {previewMode && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white z-10 px-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-sm">
            <div className="text-yellow-400 text-4xl sm:text-6xl mb-3 sm:mb-4">🖼️</div>
            <p className="text-sm sm:text-base mb-2 font-medium">Modo Vista Previa 3D</p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              AR no disponible. Disfruta de la vista 3D de la obra
            </p>
          </div>
        </div>
      )}

      {/* Controls - Touch Optimized for AR Sessions */}
      {isSessionActive && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 sm:gap-4 z-10">
          <Button
            variant="outline"
            className="bg-black/70 backdrop-blur-sm border-white/30 text-white hover:bg-black/90 min-h-[48px] min-w-[48px] p-3"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="bg-black/70 backdrop-blur-sm border-white/30 text-white hover:bg-black/90 min-h-[48px] min-w-[48px] p-3"
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ARViewer;