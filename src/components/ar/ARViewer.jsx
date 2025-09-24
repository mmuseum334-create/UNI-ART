import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
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

  useEffect(() => {
    let isMounted = true;

    const initAR = async () => {
      try {
        // Importar THREE.js dinámicamente
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { XRButton } = await import('three/examples/jsm/webxr/XRButton.js');

        if (!isMounted) return;

        // Configurar la escena
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Configurar el renderer
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

        // Crear objeto 3D básico como placeholder
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          metalness: 0.7,
          roughness: 0.3
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0, -0.5);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);

        // Agregar texto 3D básico
        const loader = new THREE.FontLoader();
        try {
          // En una implementación real, cargarías una fuente
          const textGeometry = new THREE.PlaneGeometry(0.4, 0.1);
          const textMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8
          });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.set(0, 0.3, -0.5);
          scene.add(textMesh);
        } catch (error) {
          console.log('No se pudo cargar la fuente:', error);
        }

        // Configurar controles de XR
        const controller = renderer.xr.getController(0);
        controller.addEventListener('select', () => {
          // Rotar el cubo al hacer tap
          cube.rotation.y += Math.PI / 4;
        });
        scene.add(controller);

        // Agregar el renderer al DOM
        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement);
        }

        // Crear botón AR
        const xrButton = XRButton.createButton(renderer, {
          requiredFeatures: ['local'],
          optionalFeatures: ['dom-overlay', 'hit-test']
        });

        xrButton.style.position = 'absolute';
        xrButton.style.bottom = '20px';
        xrButton.style.left = '50%';
        xrButton.style.transform = 'translateX(-50%)';
        xrButton.style.padding = '12px 24px';
        xrButton.style.backgroundColor = '#007bff';
        xrButton.style.border = 'none';
        xrButton.style.borderRadius = '25px';
        xrButton.style.color = 'white';
        xrButton.style.fontSize = '16px';
        xrButton.style.cursor = 'pointer';

        if (containerRef.current) {
          containerRef.current.appendChild(xrButton);
        }

        // Manejar eventos de sesión XR
        renderer.xr.addEventListener('sessionstart', () => {
          setIsSessionActive(true);
          if (sessionRef.current) {
            sessionRef.current = renderer.xr.getSession();
          }
        });

        renderer.xr.addEventListener('sessionend', () => {
          setIsSessionActive(false);
          sessionRef.current = null;
        });

        // Loop de renderizado
        const animate = () => {
          renderer.setAnimationLoop(() => {
            if (cube) {
              cube.rotation.x += 0.01;
              cube.rotation.z += 0.01;
            }
            renderer.render(scene, camera);
          });
        };

        animate();
        setIsLoading(false);

        // Cleanup
        return () => {
          if (renderer.domElement && containerRef.current) {
            containerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };

      } catch (err) {
        console.error('Error inicializando AR:', err);
        setError(err.message);
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

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-between items-start">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
            <h3 className="font-bold text-lg mb-2">{artwork.title}</h3>
            <p className="text-sm text-gray-300 mb-2">por {artwork.artist}</p>
            <p className="text-xs text-gray-400">{artwork.description}</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExit}
              variant="outline"
              size="sm"
              className="bg-black/70 backdrop-blur-sm border-white/30 text-white hover:bg-black/90"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!isSessionActive && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white z-10">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 max-w-sm">
            <Info className="h-8 w-8 mx-auto mb-4 text-blue-400" />
            <p className="text-sm mb-2">Toca el botón "ENTER AR" para iniciar</p>
            <p className="text-xs text-gray-300">
              Mueve tu dispositivo para ver el objeto 3D y toca la pantalla para interactuar
            </p>
          </div>
        </div>
      )}

      {/* Controls - Solo mostrar cuando AR está activo */}
      {isSessionActive && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/70 backdrop-blur-sm border-white/30 text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-black/70 backdrop-blur-sm border-white/30 text-white"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ARViewer;