'use client';

/**
 * VirtualMuseumScene — migrado de A-Frame a React Three Fiber
 *
 * Dependencias a instalar:
 *   npm install @react-three/fiber @react-three/drei three
 *
 * Reemplaza el archivo anterior VirtualMuseumScene.jsx con este.
 * El resto del proyecto (servicios, hooks, rutas) no cambia.
 */

import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

import { sculptureService } from '@/services/sculpture/sculptureService';
import { paintService } from '@/services/paint/paintService';
import { usePermissions } from '@/hooks/usePermissions';

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────
const LIMIT_X = 18;
const LIMIT_Z = 20;
const MOVE_SPEED = 8;
const LOOK_SENSITIVITY = 0.002;

// ─────────────────────────────────────────────
// MUSEO GLB (el edificio)
// ─────────────────────────────────────────────
function MuseumBuilding() {
  const { scene } = useGLTF('/models/render02.glb');
  // El edificio no necesita clonarse: es único en escena
  return <primitive object={scene} position={[0, -1.6, 0]} />;
}

// ─────────────────────────────────────────────
// ESCULTURA — carga lazy con Suspense
// ─────────────────────────────────────────────
function SculptureModel({ url, scale }) {
  const { scene } = useGLTF(url);
  // Clonar solo cuando cambia la URL — evita clonar en cada render
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={cloned} scale={[scale, scale, scale]} />;
}

// ─────────────────────────────────────────────
// PINTURA — plano + marco + imagen
// ─────────────────────────────────────────────
function PaintingMesh({ imgUrl, scale }) {
  const texture = useTexture(imgUrl);
  // Anisotropía máxima para texturas nítidas en ángulo
  useMemo(() => { texture.anisotropy = 16; texture.needsUpdate = true; }, [texture]);
  return (
    <group scale={[scale, scale, scale]}>
      {/* Marco */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.2, 2.2, 0.05]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      {/* Lienzo */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────
// PLACA INFORMATIVA (HTML en 3D)
// Para esculturas: se muestra/oculta con click
// ─────────────────────────────────────────────
function Plaque({ placement, isActive = false }) {
  const isPaint = placement.type === 'paint';
  const [visible, setVisible] = useState(isPaint); // pinturas siempre visibles
  const name = isPaint ? placement.artwork.nombre_pintura : placement.artwork.nombre_escultura;
  const desc = isPaint ? placement.artwork.descripcion_pintura : placement.artwork.descripcion_escultura;
  const artist = placement.artwork.artista;

  const pos = isPaint ? [0, -1.4, 0.05] : [0, -0.5, 1.2];
  const rot = isPaint ? [0, 0, 0] : [0, 0, 0];

  if (!visible && !isActive) {
    // Para esculturas en modo normal: mostrar botón flotante pequeño para abrir
    return (
      <group position={pos} rotation={rot}>
        <Html transform occlude={false} distanceFactor={3} style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => setVisible(true)}
            style={{
              background: 'rgba(10,10,10,0.75)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: '4px 10px',
              color: '#aaa',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
            }}
          >ℹ info</button>
        </Html>
      </group>
    );
  }

  return (
    <group position={pos} rotation={rot}>
      <Html
        transform
        occlude={false}
        style={{ pointerEvents: isPaint ? 'none' : 'auto', userSelect: 'none' }}
        distanceFactor={3}
      >
        <div
          style={{
            background: isActive ? 'rgba(79,70,229,0.92)' : 'rgba(10,10,10,0.92)',
            border: `1px solid ${isActive ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 8,
            padding: '8px 12px',
            width: 200,
            color: '#fff',
            fontFamily: 'system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {!isPaint && !isActive && (
            <button
              onClick={() => setVisible(false)}
              style={{ position: 'absolute', top: 4, right: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}
            >✕</button>
          )}
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: !isPaint ? 14 : 0 }}>{name}</div>
          <div style={{ fontSize: 10, color: '#aaa', marginBottom: 4 }}>Por: {artist}</div>
          <div style={{ fontSize: 9, color: '#ccc', lineHeight: 1.4 }}>{(desc || '').substring(0, 100)}...</div>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────
// OBRA COLOCADA (escultura o pintura)
// ─────────────────────────────────────────────
function PlacedArtwork({ placement }) {
  const rotRad = THREE.MathUtils.degToRad(placement.ry);
  return (
    <group position={[placement.x, placement.y, placement.z]}>
      <group rotation={[0, rotRad, 0]}>
        <Suspense fallback={null}>
          {placement.type === 'sculpture' ? (
            <SculptureModel url={placement.artwork.modelo_3d_url} scale={placement.scale} />
          ) : (
            <PaintingMesh imgUrl={placement.artwork.img_pintura} scale={placement.scale} />
          )}
        </Suspense>
        <Plaque placement={placement} />
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────
// OBRA ACTIVA (en modo colocación) — con bounding box
// ─────────────────────────────────────────────
function ActiveArtwork({ placement }) {
  const rotRad = THREE.MathUtils.degToRad(placement.ry);
  return (
    <group position={[placement.x, placement.y, placement.z]}>
      <group rotation={[0, rotRad, 0]}>
        <Suspense fallback={null}>
          {placement.type === 'sculpture' ? (
            <SculptureModel url={placement.artwork.modelo_3d_url} scale={placement.scale} />
          ) : (
            <PaintingMesh imgUrl={placement.artwork.img_pintura} scale={placement.scale} />
          )}
        </Suspense>
        <mesh>
          <boxGeometry args={[2.5, 2.5, 2.5]} />
          <meshBasicMaterial color="#4f46e5" wireframe opacity={0.3} transparent />
        </mesh>
        <Plaque placement={placement} isActive />
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────
// BOTÓN CON ACCIÓN CONTINUA AL MANTENER PRESIONADO
// ─────────────────────────────────────────────
function HoldButton({ onAction, children, className }) {
  const ivRef = useRef(null);
  const start = () => { onAction(); ivRef.current = setInterval(onAction, 80); };
  const stop = () => { clearInterval(ivRef.current); ivRef.current = null; };
  return (
    <button className={className} onPointerDown={start} onPointerUp={stop} onPointerLeave={stop}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// CONTROLADOR DE CÁMARA FPS
// Maneja WASD + mouse look con pointer lock
// ─────────────────────────────────────────────
function FPSController({ enabled }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isLocked = useRef(false);
  // Pre-alocar vectores fuera de useFrame para evitar GC cada frame
  const dir = useRef(new THREE.Vector3());
  const front = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(0, 1.6, 0);

    const onKeyDown = (e) => { keys.current[e.code] = true; };
    const onKeyUp = (e) => { keys.current[e.code] = false; };

    const onMouseMove = (e) => {
      if (!isLocked.current) return;
      yaw.current -= e.movementX * LOOK_SENSITIVITY;
      pitch.current -= e.movementY * LOOK_SENSITIVITY;
      pitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch.current));
    };

    const onPointerLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement;
    };

    const onClick = () => {
      if (enabled && !isLocked.current) gl.domElement.requestPointerLock();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    gl.domElement.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      gl.domElement.removeEventListener('click', onClick);
      if (document.exitPointerLock) document.exitPointerLock();
    };
  }, [enabled, camera, gl]);

  useFrame((_, delta) => {
    if (!enabled) return;

    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    const speed = MOVE_SPEED * delta;
    // Reusar vectores pre-alocados — sin new THREE.Vector3() por frame
    dir.current.set(0, 0, 0);
    front.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    if (keys.current['KeyW'] || keys.current['ArrowUp'])    dir.current.add(front.current);
    if (keys.current['KeyS'] || keys.current['ArrowDown'])  dir.current.sub(front.current);
    if (keys.current['KeyA'] || keys.current['ArrowLeft'])  dir.current.sub(right.current);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) dir.current.add(right.current);

    if (dir.current.lengthSq() > 0) {
      dir.current.normalize().multiplyScalar(speed);
      camera.position.add(dir.current);
    }

    camera.position.x = Math.max(-LIMIT_X, Math.min(LIMIT_X, camera.position.x));
    camera.position.z = Math.max(-LIMIT_Z, Math.min(LIMIT_Z, camera.position.z));
    camera.position.y = Math.max(1.6, camera.position.y);
  });

  return null;
}

// ─────────────────────────────────────────────
// ESCENA 3D COMPLETA
// Expone la cámara hacia afuera via onCameraReady
// ─────────────────────────────────────────────
function CameraExposer({ onReady }) {
  const { camera } = useThree();
  useEffect(() => { onReady(camera); }, [camera, onReady]);
  return null;
}

function MuseumScene({ placements, activePlacement, controlsEnabled, onCameraReady }) {
  return (
    <>
      {/* Luz ambiente + direccional optimizadas */}
      <ambientLight color="#ffffff" intensity={2.2} />
      <directionalLight color="#ffffff" intensity={1.2} position={[-1, 4, 2]} castShadow={false} />

      <CameraExposer onReady={onCameraReady} />
      <FPSController enabled={controlsEnabled} />

      <Suspense fallback={null}>
        <MuseumBuilding />
      </Suspense>

      {placements.map((p) => (
        <PlacedArtwork key={p.uniqueId} placement={p} />
      ))}

      {activePlacement && <ActiveArtwork placement={activePlacement} />}
    </>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function VirtualMuseumScene() {
  const [artworks, setArtworks] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [activePlacement, setActivePlacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  // Paso de movimiento ajustable por el usuario (0.05 - 1.0)
  const [step, setStep] = useState(0.1);
  const [showCollection, setShowCollection] = useState(true);
  const [showExposition, setShowExposition] = useState(true);
  const cameraRef = useRef(null);

  const { isSuperAdmin } = usePermissions();

  const handleCameraReady = useCallback((cam) => { cameraRef.current = cam; }, []);

  // ── Carga de datos ──────────────────────────
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const progressTimer = setInterval(() => {
          setLoadingProgress(p => Math.min(p + 5, 85));
        }, 100);

        const [sculpturesRes, paintsRes] = await Promise.all([
          sculptureService.getAll(),
          paintService.getAll(),
        ]);

        clearInterval(progressTimer);
        setLoadingProgress(100);

        let allArtworks = [];
        let initialPlacements = [];

        if (sculpturesRes.success && sculpturesRes.data) {
          const completed = sculpturesRes.data.filter(
            s => s.estado_procesamiento === 'completado' && s.modelo_3d_url
          );
          completed.forEach(s => {
            const aw = { ...s, type: 'sculpture' };
            allArtworks.push(aw);
            if (s.pos_x !== null && s.pos_x !== undefined) {
              initialPlacements.push({
                uniqueId: `sculpture_${s.id}`,
                id: s.id, type: 'sculpture', artwork: aw,
                x: s.pos_x, y: s.pos_y, z: s.pos_z,
                ry: s.rot_y, scale: s.scale || 1,
              });
            }
          });
        }

        if (paintsRes.success && paintsRes.data) {
          paintsRes.data.forEach(p => {
            const aw = { ...p, type: 'paint' };
            allArtworks.push(aw);
            if (p.pos_x !== null && p.pos_x !== undefined) {
              initialPlacements.push({
                uniqueId: `paint_${p.id}`,
                id: p.id, type: 'paint', artwork: aw,
                x: p.pos_x, y: p.pos_y, z: p.pos_z,
                ry: p.rot_y, scale: p.scale || 1,
              });
            }
          });
        }

        setArtworks(allArtworks);
        setPlacements(initialPlacements);
        setTimeout(() => setLoading(false), 300);
      } catch (e) {
        console.error('Error cargando obras:', e);
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // ── Acciones del curador ────────────────────
  const startPlacing = useCallback((artwork) => {
    // Posicionar la obra a ~3 m delante de la cámara actual
    let spawnX = 0, spawnY = artwork.type === 'paint' ? 1.6 : 0, spawnZ = -3;
    if (cameraRef.current) {
      const cam = cameraRef.current;
      const dir = new THREE.Vector3();
      cam.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      spawnX = cam.position.x + dir.x * 3;
      spawnZ = cam.position.z + dir.z * 3;
      if (artwork.type === 'paint') spawnY = cam.position.y;
    }
    setActivePlacement({
      uniqueId: `${artwork.type}_${artwork.id}`,
      id: artwork.id,
      type: artwork.type,
      artwork,
      x: spawnX,
      y: spawnY,
      z: spawnZ,
      ry: 0,
      scale: 1,
    });
  }, []);

  const confirmPlacement = useCallback(async () => {
    if (!activePlacement) return;
    const { id, type, x, y, z, ry, scale } = activePlacement;
    try {
      const payload = { pos_x: x, pos_y: y, pos_z: z, rot_y: ry, scale };
      if (type === 'sculpture') await sculptureService.update(id, payload);
      else await paintService.update(id, payload);
    } catch (err) {
      console.error('Error guardando posición:', err);
    }
    setPlacements(prev => {
      const filtered = prev.filter(p => p.uniqueId !== activePlacement.uniqueId);
      return [...filtered, activePlacement];
    });
    setActivePlacement(null);
  }, [activePlacement]);

  const cancelPlacement = useCallback(() => setActivePlacement(null), []);

  const removePlacement = useCallback(async (uniqueId) => {
    const placement = placements.find(p => p.uniqueId === uniqueId);
    if (!placement) return;
    try {
      const payload = { pos_x: null, pos_y: null, pos_z: null, rot_y: null, scale: null };
      if (placement.type === 'sculpture') await sculptureService.update(placement.id, payload);
      else await paintService.update(placement.id, payload);
    } catch (err) {
      console.error('Error removiendo posición:', err);
    }
    setPlacements(prev => prev.filter(p => p.uniqueId !== uniqueId));
  }, [placements]);

  const editPlacement = useCallback((uniqueId) => {
    const placement = placements.find(p => p.uniqueId === uniqueId);
    if (!placement) return;
    setPlacements(prev => prev.filter(p => p.uniqueId !== uniqueId));
    setActivePlacement({ ...placement });
  }, [placements]);

  // updateActive usa el paso actual (`step`) para X/Z, fijo para rotación/Y/scale
  const updateActive = useCallback((key, delta) => {
    setActivePlacement(prev => prev ? { ...prev, [key]: prev[key] + delta } : null);
  }, []);

  // ── Pantalla de carga ───────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-center space-y-6 px-8 w-full max-w-sm">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div
              className="absolute inset-0 rounded-full border-4 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"
              style={{ animationDuration: '0.8s' }}
            />
          </div>
          <div>
            <p className="text-white font-semibold text-lg tracking-wide mb-1">Cargando Museo</p>
            <p className="text-white/40 text-sm">Preparando experiencia inmersiva...</p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Render principal ────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">

      {/* ── Canvas 3D ── */}
      <Canvas
        camera={{ fov: 70, near: 0.1, far: 200, position: [0, 1.6, 0] }}
        gl={{
          antialias: true,          // desactivar software AA
          powerPreference: 'high-performance',
          stencil: false,            // no se usa stencil buffer
          depth: true,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}  // resolución nativa, máx 2x
        style={{ position: 'absolute', inset: 0 }}
      >
        <MuseumScene
          placements={placements}
          activePlacement={activePlacement}
          controlsEnabled={true}
          onCameraReady={handleCameraReady}
        />
      </Canvas>

      {/* ── UI OVERLAY ── */}

      {/* Botón Salir */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 z-[10000] bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg border border-white/20 flex items-center gap-2 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Salir del Museo
      </button>

      {/* Botón Modo Curador */}
      {isSuperAdmin() && (
        <button
          onClick={() => { setEditMode(m => !m); setActivePlacement(null); }}
          className={`absolute top-6 right-6 z-[10000] px-5 py-2.5 rounded-full font-medium transition-all shadow-lg border flex items-center gap-2 text-sm ${
            editMode
              ? 'bg-indigo-600 text-white border-indigo-500'
              : 'bg-white text-black border-transparent hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          {editMode ? 'Cerrar Editor' : 'Modo Curador'}
        </button>
      )}

      {/* Panel colección (modo editor) */}
      {editMode && !activePlacement && (
        <div className="absolute top-24 right-6 z-[10000] w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: showCollection ? 'calc(100vh - 120px)' : 'auto' }}>
          {/* Header colapsable */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <h3 className="text-white font-bold text-base leading-tight">Colección Global</h3>
              <p className="text-gray-400 text-[10px] mt-0.5">Selecciona una obra para colocarla.</p>
            </div>
            <button
              onClick={() => setShowCollection(v => !v)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0"
              title={showCollection ? 'Ocultar' : 'Mostrar'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {showCollection ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
              </svg>
            </button>
          </div>
          {showCollection && (
            <div className="overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/20" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {artworks.map(aw => {
                const name = aw.type === 'sculpture' ? aw.nombre_escultura : aw.nombre_pintura;
                const imgUrl = aw.type === 'sculpture' ? aw.imagen_referencia_url : aw.img_pintura;
                const isPlaced = placements.some(p => p.uniqueId === `${aw.type}_${aw.id}`);
                return (
                  <div
                    key={`${aw.type}_${aw.id}`}
                    onClick={() => startPlacing(aw)}
                    className={`border rounded-xl p-3 cursor-pointer transition-colors ${
                      isPlaced ? 'bg-indigo-900/30 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 relative">
                        {imgUrl
                          ? <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">—</div>
                        }
                        <div className="absolute top-0 right-0 bg-black/60 text-[8px] font-bold px-1 text-white uppercase">
                          {aw.type === 'paint' ? 'PINT' : 'ESC'}
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-white text-sm font-semibold line-clamp-1">{name}</h4>
                        <p className="text-gray-400 text-xs line-clamp-1">{aw.artista}</p>
                      </div>
                      {isPlaced && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
              {artworks.length === 0 && (
                <p className="text-gray-400 text-sm text-center mt-6">No hay obras disponibles.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Panel de posicionamiento de obra activa — esquina inferior derecha */}
      {activePlacement && (
        <div className="absolute bottom-6 right-6 z-[10000] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl w-[320px]">
          <div className="text-center border-b border-white/10 pb-3">
            <h3 className="text-white font-bold text-sm">
              Acomodando:{' '}
              {activePlacement.type === 'sculpture'
                ? activePlacement.artwork.nombre_escultura
                : activePlacement.artwork.nombre_pintura}
            </h3>
          </div>

          {/* Control de paso */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold whitespace-nowrap">Paso XZ</span>
            <input
              type="range" min="0.05" max="1" step="0.05"
              value={step}
              onChange={e => setStep(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-white text-xs font-mono w-8 text-right">{step.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-white">
            {[
              { label: 'Z (adelante/atrás)', key: 'z', neg: -step, pos: step },
              { label: 'X (izq/der)', key: 'x', neg: -step, pos: step },
              { label: 'Rotación', key: 'ry', neg: -5, pos: 5, negLabel: '↺', posLabel: '↻' },
            ].map(({ label, key, neg, pos, negLabel, posLabel }) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">{label}</span>
                <div className="flex gap-1">
                  <HoldButton onAction={() => updateActive(key, neg)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs">{negLabel || '−'}</HoldButton>
                  <HoldButton onAction={() => updateActive(key, pos)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs">{posLabel || '+'}</HoldButton>
                </div>
              </div>
            ))}
            <div className="col-span-3 flex justify-center gap-4 mt-2">
              {[
                { label: 'Altura (Y)', key: 'y', neg: -0.05, pos: 0.05, negLabel: '↓', posLabel: '↑' },
                { label: 'Tamaño', key: 'scale', neg: -0.05, pos: 0.05, negLabel: 'S−', posLabel: 'S+' },
              ].map(({ label, key, neg, pos, negLabel, posLabel }) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{label}</span>
                  <div className="flex gap-1">
                    <HoldButton onAction={() => updateActive(key, neg)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs">{negLabel}</HoldButton>
                    <HoldButton onAction={() => updateActive(key, pos)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs">{posLabel}</HoldButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={cancelPlacement} className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors text-sm">Cancelar</button>
            <button onClick={confirmPlacement} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-sm">Fijar y Guardar en BD</button>
          </div>
        </div>
      )}

      {/* Lista obras en exposición (modo editor) — inferior izquierda, colapsable */}
      {editMode && !activePlacement && placements.length > 0 && (
        <div className="absolute bottom-6 left-6 z-[10000] bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl w-64 overflow-hidden">
          {/* Header colapsable */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              En Exposición ({placements.length})
            </h4>
            <button
              onClick={() => setShowExposition(v => !v)}
              className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title={showExposition ? 'Ocultar' : 'Mostrar'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {showExposition ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
              </svg>
            </button>
          </div>
          {showExposition && (
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
              {placements.map(p => {
                const name = p.type === 'sculpture' ? p.artwork.nombre_escultura : p.artwork.nombre_pintura;
                return (
                  <div key={p.uniqueId} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                    <span className="text-white text-xs truncate max-w-[110px]">{name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => editPlacement(p.uniqueId)} title="Editar posición" className="text-indigo-400 hover:text-indigo-300 p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button onClick={() => removePlacement(p.uniqueId)} title="Quitar del museo" className="text-red-400 hover:text-red-300 p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ayuda de controles */}
      {!editMode && !activePlacement && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-black/50 backdrop-blur-md text-white/80 px-6 py-3 rounded-full text-xs flex gap-6 border border-white/10 pointer-events-none">
          <span className="flex items-center gap-2">
            <kbd className="bg-white/20 px-2 py-1 rounded">W A S D</kbd> Moverse
          </span>
          <span className="flex items-center gap-2">
            <kbd className="bg-white/20 px-2 py-1 rounded">Click</kbd> Activar mirada
          </span>
          <span className="flex items-center gap-2">
            <kbd className="bg-white/20 px-2 py-1 rounded">Esc</kbd> Liberar cursor
          </span>
        </div>
      )}
    </div>
  );
}