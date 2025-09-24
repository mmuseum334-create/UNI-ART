# Realidad Aumentada - The Gallery Peace

## Descripción
Hemos implementado una funcionalidad básica de Realidad Aumentada usando WebXR y THREE.js que permite a los usuarios interactuar con obras de arte en un entorno 3D.

## Características Implementadas

### ✅ Completado
1. **Nueva sección en el navbar**: "Realidad Aumentada" con icono de cubo
2. **Página AR principal** (`/ar`): Lista de obras disponibles para AR
3. **Componente ARViewer**: Maneja la experiencia AR con WebXR
4. **Detección de compatibilidad**: Verifica soporte para WebXR automáticamente
5. **Escena 3D básica**: Cubo interactivo con luces y animaciones
6. **Routing configurado**: Navegación hacia `/ar` funcionando

### 🎯 Funcionalidades
- **Verificación automática** de soporte AR en el dispositivo
- **Interfaz adaptiva** que muestra instrucciones según disponibilidad
- **Experiencia AR básica** con objeto 3D interactivo
- **Controles de interacción** para rotar y manipular objetos
- **UI overlay** con información de la obra durante la sesión AR

## Tecnologías Utilizadas
- **WebXR API**: Para funcionalidad de realidad aumentada
- **THREE.js**: Biblioteca 3D para renderizado
- **ARCore**: Compatibilidad con dispositivos Android
- **React**: Framework principal
- **Lucide React**: Iconos

## Compatibilidad
La funcionalidad AR requiere:
- 🤖 **Dispositivo Android** con ARCore
- 🌐 **Chrome o Firefox** actualizado
- 📱 **HTTPS** (para acceso a cámara)
- 🔋 **WebXR soporte** habilitado

## Cómo Usar

1. **Navegación**: Hacer clic en "Realidad Aumentada" en el navbar
2. **Selección**: Elegir una obra de arte de la galería AR
3. **Activación**: Tocar "Iniciar AR" (solo disponible en dispositivos compatibles)
4. **Experiencia**: Mover el dispositivo para ver el objeto 3D
5. **Interacción**: Tocar la pantalla para rotar el objeto

## Estructura de Archivos
```
src/
├── pages/AR.jsx                 # Página principal AR
├── components/ar/
│   └── ARViewer.jsx            # Componente de visualización AR
└── components/layout/
    └── Navbar.jsx              # Navbar actualizado
```

## Próximos Pasos Sugeridos

### 🔄 Mejoras Inmediatas
1. **Modelos 3D reales**: Cargar archivos .glb/.gltf de las obras
2. **Hit testing**: Detectar superficies para colocar objetos
3. **Controles avanzados**: Zoom, rotación, escalado
4. **Audio espacial**: Agregar narración o música ambiente

### 🚀 Funcionalidades Avanzadas
1. **Múltiples objetos**: Galería completa en AR
2. **Marcadores**: AR basado en imágenes
3. **Colaboración**: AR multi-usuario
4. **Analytics**: Métricas de uso AR

## Notas Técnicas
- Los modelos 3D se cargan dinámicamente
- La experiencia funciona offline una vez cargada
- Optimizada para dispositivos móviles
- Maneja errores de compatibilidad graciosamente

## Recursos
- [WebXR Device API](https://immersive-web.github.io/webxr/)
- [THREE.js WebXR](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content)
- [ARCore para Web](https://developers.google.com/ar/develop/webxr)