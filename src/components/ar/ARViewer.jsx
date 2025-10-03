'use client'

/**
 * ARViewer - Augmented Reality viewer for artworks using WebXR
 * Shows 3D preview and AR when available
 */
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Info } from 'lucide-react';

const ARViewer = ({ artwork, onExit }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasARSupport, setHasARSupport] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let renderer = null;
    let arButton = null;

    const init3DScene = async () => {
      try {
        console.log('Iniciando escena 3D...');

        // Importar THREE.js
        const THREE = await import('three');

        if (!isMounted) return;

        // Crear escena
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // Crear renderer
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.xr.enabled = true;
        rendererRef.current = renderer;

        // Agregar al DOM
        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement);
        }

        // Crear cámara
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.z = 3;

        // Crear luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(2, 3, 4);
        scene.add(pointLight);

        // Crear obra de arte 3D
        const artworkGroup = new THREE.Group();

        // Marco
        const frameGeometry = new THREE.BoxGeometry(1.2, 1.6, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: 0x8B4513,
          roughness: 0.7,
          metalness: 0.3
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        artworkGroup.add(frame);

        // Lienzo (color basado en el artista)
        let canvasColor = 0xff6b6b;
        if (artwork.artist.toLowerCase().includes('silva')) {
          canvasColor = 0x4ecdc4;
        } else if (artwork.artist.toLowerCase().includes('gonzalez')) {
          canvasColor = 0xffe66d;
        } else if (artwork.artist.toLowerCase().includes('vargas')) {
          canvasColor = 0xc44569;
        }

        const canvasGeometry = new THREE.PlaneGeometry(1, 1.4);
        const canvasMaterial = new THREE.MeshStandardMaterial({
          color: canvasColor,
          roughness: 0.8
        });
        const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
        canvas.position.z = 0.051;
        artworkGroup.add(canvas);

        // Agregar algunos detalles decorativos (esferas)
        for (let i = 0; i < 5; i++) {
          const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
          const sphereMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            roughness: 0.5,
            metalness: 0.5
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.set(
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 1.2,
            0.1
          );
          artworkGroup.add(sphere);
        }

        artworkGroup.position.set(0, 0, 0);
        scene.add(artworkGroup);

        // Verificar soporte AR
        let arSupported = false;
        if (navigator.xr) {
          try {
            arSupported = await navigator.xr.isSessionSupported('immersive-ar');
            setHasARSupport(arSupported);
            console.log('AR soportado:', arSupported);
          } catch (e) {
            console.log('Error verificando AR:', e);
          }
        }

        // Crear botón AR si hay soporte
        if (arSupported) {
          arButton = document.createElement('button');
          arButton.textContent = '📱 INICIAR AR';
          arButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            padding: 16px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: transform 0.2s;
          `;

          arButton.onmouseover = () => {
            arButton.style.transform = 'translateX(-50%) scale(1.05)';
          };
          arButton.onmouseout = () => {
            arButton.style.transform = 'translateX(-50%) scale(1)';
          };

          arButton.onclick = async () => {
            try {
              console.log('Solicitando sesión AR...');
              const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['dom-overlay', 'hit-test']
              });

              await renderer.xr.setSession(session);
              arButton.style.display = 'none';
              setIsSessionActive(true);

              console.log('Sesión AR iniciada!');
            } catch (error) {
              console.error('Error al iniciar AR:', error);
              alert('No se pudo iniciar AR: ' + error.message);
            }
          };

          if (containerRef.current) {
            containerRef.current.appendChild(arButton);
          }
        }

        // Eventos de sesión XR
        renderer.xr.addEventListener('sessionstart', () => {
          console.log('Sesión AR iniciada');
          setIsSessionActive(true);
        });

        renderer.xr.addEventListener('sessionend', () => {
          console.log('Sesión AR finalizada');
          setIsSessionActive(false);
          if (arButton) {
            arButton.style.display = 'block';
          }
        });

        // Loop de animación
        const animate = () => {
          renderer.setAnimationLoop(() => {
            // Rotar la obra
            artworkGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.3;
            artworkGroup.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;

            // Flotación sutil
            artworkGroup.position.y = Math.sin(Date.now() * 0.002) * 0.1;

            renderer.render(scene, camera);
          });
        };

        animate();
        setIsLoading(false);
        console.log('Escena 3D cargada correctamente');

        // Manejar resize
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          if (renderer) {
            renderer.setAnimationLoop(null);
            if (renderer.domElement && containerRef.current?.contains(renderer.domElement)) {
              containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
          }
          if (arButton && containerRef.current?.contains(arButton)) {
            containerRef.current.removeChild(arButton);
          }
        };

      } catch (err) {
        console.error('Error inicializando 3D:', err);
        setError('Error al cargar la vista 3D: ' + err.message);
        setIsLoading(false);
      }
    };

    const cleanup = init3DScene();

    return () => {
      isMounted = false;
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(fn => fn && fn());
      }
    };
  }, [artwork]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Cargando vista 3D...</p>
          <p className="text-sm mt-2 text-gray-300">Preparando la experiencia</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <Button
            onClick={onExit}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Contenedor 3D */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Header con info */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 text-white flex-1 max-w-md border border-white/10">
            <h3 className="font-bold text-lg mb-2">{artwork.title}</h3>
            <p className="text-sm text-gray-300 mb-1">por {artwork.artist}</p>
            <p className="text-xs text-gray-400 line-clamp-2">{artwork.description}</p>
          </div>

          <Button
            onClick={onExit}
            variant="outline"
            size="sm"
            className="bg-black/80 backdrop-blur-md border-white/20 text-white hover:bg-black/90 min-h-[44px] min-w-[44px] p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Instrucciones */}
      {!isSessionActive && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center text-white z-10 px-4 max-w-md">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <Info className="h-8 w-8 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-bold mb-2">Vista 3D Activa</h3>
            <p className="text-sm text-gray-300 mb-3">
              {hasARSupport
                ? '¡Toca el botón "INICIAR AR" para ver esta obra en tu espacio!'
                : 'Disfruta de la vista 3D de esta obra de arte'}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Rotando automáticamente
            </div>
          </div>
        </div>
      )}

      {/* Indicador de AR activo */}
      {isSessionActive && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-pulse">
            🎯 AR ACTIVO - Mueve tu dispositivo
          </div>
        </div>
      )}
    </div>
  );
};

export default ARViewer;
