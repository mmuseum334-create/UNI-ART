'use client';

import { useEffect, useState, useRef } from 'react';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { paintService } from '@/services/paint/paintService';
import { usePermissions } from '@/hooks/usePermissions';

export default function VirtualMuseumScene() {
  const [mounted, setMounted] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [activePlacement, setActivePlacement] = useState(null);

  const { isSuperAdmin } = usePermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    import('aframe').then(() => {
      // Registrar componente de límites para evitar salirse del museo (aproximación genérica)
      if (window.AFRAME && !window.AFRAME.components['museum-bounds']) {
        window.AFRAME.registerComponent('museum-bounds', {
          tick: function () {
            const pos = this.el.object3D.position;
            // Limitar X y Z para no atravesar las paredes exteriores (Ajustar estos valores según el tamaño real del GLB)
            const LIMIT_X = 18; 
            const LIMIT_Z = 20;
            if (pos.x > LIMIT_X) pos.x = LIMIT_X;
            if (pos.x < -LIMIT_X) pos.x = -LIMIT_X;
            if (pos.z > LIMIT_Z) pos.z = LIMIT_Z;
            if (pos.z < -LIMIT_Z) pos.z = -LIMIT_Z;
            // Evitar caer por el piso
            if (pos.y < 0) pos.y = 0;
          }
        });
      }
      setMounted(true);
    });
    
    const fetchArtworks = async () => {
      try {
        const [sculpturesRes, paintsRes] = await Promise.all([
          sculptureService.getAll(),
          paintService.getAll()
        ]);
        
        let allArtworks = [];
        let initialPlacements = [];

        if (sculpturesRes.success && sculpturesRes.data) {
          const completed = sculpturesRes.data.filter(s => s.estado_procesamiento === 'completado' && s.modelo_3d_url);
          completed.forEach(s => {
            const aw = { ...s, type: 'sculpture' };
            allArtworks.push(aw);
            if (s.pos_x !== null && s.pos_x !== undefined) {
              initialPlacements.push({
                uniqueId: `sculpture_${s.id}`,
                id: s.id,
                type: 'sculpture',
                artwork: aw,
                x: s.pos_x,
                y: s.pos_y,
                z: s.pos_z,
                ry: s.rot_y,
                scale: s.scale || 1
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
                id: p.id,
                type: 'paint',
                artwork: aw,
                x: p.pos_x,
                y: p.pos_y,
                z: p.pos_z,
                ry: p.rot_y,
                scale: p.scale || 1
              });
            }
          });
        }
        
        setArtworks(allArtworks);
        setPlacements(initialPlacements);
      } catch (e) {
        console.error("Error cargando obras:", e);
      }
    };
    fetchArtworks();
  }, []);

  const startPlacing = (artwork) => {
    const camEl = document.querySelector('[camera]');
    const camPos = camEl ? camEl.getAttribute('position') : { x: 0, y: 0,z: 0 };
    
    const isPaint = artwork.type === 'paint';
    const newPlacement = {
      uniqueId: `${artwork.type}_${artwork.id}`,
      id: artwork.id,
      type: artwork.type,
      artwork,
      x: camPos.x,
      y: isPaint ? 1.6 : 0, // Las pinturas van a la altura de los ojos por defecto
      z: camPos.z - 3,
      ry: 0,
      scale: 1
    };
    setActivePlacement(newPlacement);
  };

  const confirmPlacement = async () => {
    if (activePlacement) {
      const { id, type, x, y, z, ry, scale } = activePlacement;
      
      // Actualizar en Base de Datos
      try {
        const payload = { pos_x: x, pos_y: y, pos_z: z, rot_y: ry, scale };
        if (type === 'sculpture') {
          await sculptureService.update(id, payload);
        } else if (type === 'paint') {
          await paintService.update(id, payload);
        }
      } catch (error) {
        console.error('Error guardando posición en BD:', error);
      }

      // Actualizar estado local
      const filtered = placements.filter(p => p.uniqueId !== activePlacement.uniqueId);
      setPlacements([...filtered, activePlacement]);
      setActivePlacement(null);
    }
  };

  const cancelPlacement = () => setActivePlacement(null);

  const removePlacement = async (uniqueId) => {
    const placement = placements.find(p => p.uniqueId === uniqueId);
    if (placement) {
      // Eliminar de Base de Datos
      try {
        const payload = { pos_x: null, pos_y: null, pos_z: null, rot_y: null, scale: null };
        if (placement.type === 'sculpture') {
          await sculptureService.update(placement.id, payload);
        } else if (placement.type === 'paint') {
          await paintService.update(placement.id, payload);
        }
      } catch (error) {
        console.error('Error removiendo posición en BD:', error);
      }
      // Actualizar estado local
      setPlacements(placements.filter(p => p.uniqueId !== uniqueId));
    }
  };

  const updateActive = (key, val) => {
    if (activePlacement) {
      setActivePlacement({ ...activePlacement, [key]: activePlacement[key] + val });
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-medium tracking-wide">Cargando Experiencia Inmersiva...</p>
        </div>
      </div>
    );
  }

  // Helper para renderizar la placa (Abajo de la obra, texto más pequeño)
  const renderPlaque = (p, isActive = false) => {
    const name = p.type === 'sculpture' ? p.artwork.nombre_escultura : p.artwork.nombre_pintura;
    const desc = p.type === 'sculpture' ? p.artwork.descripcion_escultura : p.artwork.descripcion_pintura;
    
    // Posición: Para pintura (Y: -1.2 debajo del centro), Para escultura (Y: 0 al nivel del piso, Z: 0.8 al frente)
    const pos = p.type === 'paint' ? "0 -1.4 0.05" : "0 0 1.2";
    // Rotación: Para pintura (recta contra pared), para escultura (inclinada hacia arriba en el piso)
    const rot = p.type === 'paint' ? "0 0 0" : "-45 0 0";

    return (
      <a-entity position={pos} rotation={rot}>
        <a-plane color={isActive ? "#4f46e5" : "#111"} width="1.0" height="0.6" position="0 0 0" opacity="0.9"></a-plane>
        <a-text value={name} position="-0.4 0.15 0.01" width="1.5" color="#fff" wrap-count="22"></a-text>
        <a-text value={`Por: ${p.artwork.artista}`} position="-0.4 0.02 0.01" width="1.2" color="#aaa" wrap-count="35"></a-text>
        <a-text value={(desc || '').substring(0, 100) + '...'} position="-0.4 -0.15 0.01" width="0.9" color="#ccc" wrap-count="30" baseline="top"></a-text>
      </a-entity>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden font-sans">
      <button 
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 z-[10000] bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg border border-white/20 flex items-center gap-2 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Salir del Museo
      </button>

      {/* Solo los super administradores ven el botón Modo Curador */}
      {isSuperAdmin() && (
        <button 
          onClick={() => setEditMode(!editMode)}
          className={`absolute top-6 right-6 z-[10000] px-5 py-2.5 rounded-full font-medium transition-all shadow-lg border flex items-center gap-2 text-sm ${
            editMode ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-black border-transparent hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          {editMode ? 'Cerrar Editor' : 'Modo Curador'}
        </button>
      )}

      {editMode && !activePlacement && (
        <div className="absolute top-24 right-6 bottom-6 w-80 z-[10000] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col shadow-2xl overflow-hidden">
          <h3 className="text-white font-bold text-lg mb-1">Colección Global</h3>
          <p className="text-gray-400 text-xs mb-4">Selecciona una obra para colocarla en el museo (se guardará en la BD).</p>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/20">
            {artworks.map(aw => {
              const name = aw.type === 'sculpture' ? aw.nombre_escultura : aw.nombre_pintura;
              const imgUrl = aw.type === 'sculpture' ? aw.imagen_referencia_url : aw.img_pintura;
              const isPlaced = placements.some(p => p.uniqueId === `${aw.type}_${aw.id}`);
              
              return (
                <div key={`${aw.type}_${aw.id}`} className={`border rounded-xl p-3 transition-colors cursor-pointer ${isPlaced ? 'bg-indigo-900/30 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`} onClick={() => startPlacing(aw)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 relative">
                      {imgUrl ? (
                        <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="8.5" cy="7.5" r="1.5"/><path d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/></svg>
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-black/60 text-[8px] font-bold px-1 text-white uppercase">{aw.type === 'paint' ? 'PINT' : 'ESC'}</div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-white text-sm font-semibold line-clamp-1">{name}</h4>
                      <p className="text-gray-400 text-xs line-clamp-1">{aw.artista}</p>
                    </div>
                    {isPlaced && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    )}
                  </div>
                </div>
              );
            })}
            {artworks.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-10">No hay obras disponibles.</p>
            )}
          </div>
        </div>
      )}

      {activePlacement && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl min-w-[320px]">
          <div className="text-center border-b border-white/10 pb-3">
            <h3 className="text-white font-bold text-sm">
              Acomodando: {activePlacement.type === 'sculpture' ? activePlacement.artwork.nombre_escultura : activePlacement.artwork.nombre_pintura}
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-white">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Adelante/Atrás (Z)</span>
              <div className="flex gap-1">
                <button onClick={() => updateActive('z', -0.5)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold">-</button>
                <button onClick={() => updateActive('z', 0.5)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold">+</button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Izquierda/Der (X)</span>
              <div className="flex gap-1">
                <button onClick={() => updateActive('x', -0.5)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold">-</button>
                <button onClick={() => updateActive('x', 0.5)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold">+</button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Rotación</span>
              <div className="flex gap-1">
                <button onClick={() => updateActive('ry', -15)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">↺</button>
                <button onClick={() => updateActive('ry', 15)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">↻</button>
              </div>
            </div>
            <div className="col-span-3 flex justify-center gap-4 mt-2">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Altura (Y)</span>
                <div className="flex gap-1">
                  <button onClick={() => updateActive('y', -0.1)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold">↓</button>
                  <button onClick={() => updateActive('y', 0.1)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold">↑</button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Tamaño</span>
                <div className="flex gap-1">
                  <button onClick={() => updateActive('scale', -0.1)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">S</button>
                  <button onClick={() => updateActive('scale', 0.1)} className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">L</button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button onClick={cancelPlacement} className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors text-sm">Cancelar</button>
            <button onClick={confirmPlacement} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-sm">Fijar y Guardar en BD</button>
          </div>
        </div>
      )}

      {!editMode && !activePlacement && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-black/50 backdrop-blur-md text-white/80 px-6 py-3 rounded-full text-xs flex gap-6 border border-white/10 pointer-events-none">
          <span className="flex items-center gap-2"><kbd className="bg-white/20 px-2 py-1 rounded">W A S D</kbd> Moverse</span>
          <span className="flex items-center gap-2"><kbd className="bg-white/20 px-2 py-1 rounded">Click + Arrastrar</kbd> Mirar</span>
        </div>
      )}

      {editMode && !activePlacement && placements.length > 0 && (
         <div className="absolute bottom-6 left-6 z-[10000] bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl max-h-48 overflow-y-auto w-64 scrollbar-thin scrollbar-thumb-white/20">
           <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">En Exposición Global ({placements.length})</h4>
           <div className="space-y-2">
             {placements.map(p => {
                const name = p.type === 'sculpture' ? p.artwork.nombre_escultura : p.artwork.nombre_pintura;
                return (
                  <div key={p.uniqueId} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                    <span className="text-white text-xs truncate max-w-[150px]">{name}</span>
                    <button onClick={() => removePlacement(p.uniqueId)} className="text-red-400 hover:text-red-300 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                );
             })}
           </div>
         </div>
      )}

      <a-scene 
        vr-mode-ui="enabled: true"
        renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true; maxCanvasWidth: 1920; maxCanvasHeight: 1920;"
      >
        {/* Precarga de imágenes de pinturas para evitar tirones */}
        <a-assets>
          {artworks.filter(a => a.type === 'paint').map(p => (
            <img key={`asset_paint_${p.id}`} id={`paint-img-${p.id}`} src={p.img_pintura} crossOrigin="anonymous" />
          ))}
        </a-assets>

        <a-entity 
          gltf-model="/models/vr_art_gallery_01.glb" 
          position="0 0 0" 
          scale="1 1 1"
          shadow="cast: true; receive: true"
        ></a-entity>

        {placements.map((p) => (
          <a-entity key={p.uniqueId} position={`${p.x} ${p.y} ${p.z}`}>
            {p.type === 'sculpture' ? (
              <a-entity 
                gltf-model={p.artwork.modelo_3d_url} 
                rotation={`0 ${p.ry} 0`}
                scale={`${p.scale} ${p.scale} ${p.scale}`}
                shadow="cast: true; receive: true"
              ></a-entity>
            ) : (
              // Pintura (Plano con imagen)
              <a-entity rotation={`0 ${p.ry} 0`} scale={`${p.scale} ${p.scale} ${p.scale}`}>
                {/* Marco de la pintura */}
                <a-box color="#3e2723" depth="0.05" width="2.2" height="2.2" position="0 0 -0.02"></a-box>
                {/* Lienzo */}
                <a-plane src={`#paint-img-${p.artwork.id}`} width="2" height="2" position="0 0 0.01"></a-plane>
              </a-entity>
            )}
            
            {/* Placa de información */}
            {renderPlaque(p)}
          </a-entity>
        ))}

        {activePlacement && (
          <a-entity position={`${activePlacement.x} ${activePlacement.y} ${activePlacement.z}`}>
            {activePlacement.type === 'sculpture' ? (
              <a-entity 
                gltf-model={activePlacement.artwork.modelo_3d_url} 
                rotation={`0 ${activePlacement.ry} 0`}
                scale={`${activePlacement.scale} ${activePlacement.scale} ${activePlacement.scale}`}
              ></a-entity>
            ) : (
              <a-entity rotation={`0 ${activePlacement.ry} 0`} scale={`${activePlacement.scale} ${activePlacement.scale} ${activePlacement.scale}`}>
                <a-box color="#3e2723" depth="0.05" width="2.2" height="2.2" position="0 0 -0.02"></a-box>
                <a-plane src={`#paint-img-${activePlacement.artwork.id}`} width="2" height="2" position="0 0 0.01"></a-plane>
              </a-entity>
            )}
            <a-box color="#4f46e5" wireframe="true" opacity="0.3" scale="2.5 2.5 2.5"></a-box>
            {renderPlaque(activePlacement, true)}
          </a-entity>
        )}

        <a-light type="ambient" color="#ffffff" intensity="2"></a-light>
        <a-light type="directional" color="#ffffff" intensity="1.5" position="-1 2 1"></a-light>
        <a-light type="directional" color="#ffffff" intensity="1.5" position="1 2 -1"></a-light>

        <a-entity position="0 0 0" ref={cameraRef} museum-bounds>
          <a-camera 
            wasd-controls="acceleration: 20; fly: false;" 
            look-controls="pointerLockEnabled: false"
          ></a-camera>
        </a-entity>
        
        <a-sky color="#87CEEB"></a-sky>
      </a-scene>
    </div>
  );
}
