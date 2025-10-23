# Modelos 3D para el Museo

Esta carpeta contiene los modelos 3D utilizados en la experiencia de Realidad Aumentada.

## Formatos Soportados
- **GLB** (recomendado): Binario compacto de glTF
- **GLTF**: Formato de texto con archivos separados

## Fuentes de Modelos 3D Gratuitos

### Para Pinturas y Cuadros:
1. **Sketchfab** (https://sketchfab.com)
   - Busca "painting frame" o "picture frame"
   - Filtro: Downloadable, Free
   - Formatos: GLB/GLTF

2. **Google Poly Archive** (https://poly.pizza)
   - Archivo de modelos de Google Poly
   - Muchos modelos simples y gratuitos

3. **glTF Sample Models** (https://github.com/KhronosGroup/glTF-Sample-Models)
   - Repositorio oficial de Khronos
   - Modelos optimizados para web

4. **Free3D** (https://free3d.com)
   - Categoría: Art / Paintings
   - Convierte a GLB si es necesario

## Cómo Agregar un Modelo

1. Descarga el modelo en formato .glb o .gltf
2. Colócalo en esta carpeta `/public/models/`
3. Actualiza el archivo de configuración en `src/data/arModels.js`

Ejemplo:
```javascript
{
  id: 4,
  title: 'La Mona Lisa 3D',
  modelUrl: '/models/monalisa.glb',
  // ... otros datos
}
```

## Optimización

- Mantén los archivos GLB < 5MB para carga rápida
- Usa herramientas como glTF-Transform para comprimir:
  ```bash
  npx gltf-transform optimize input.glb output.glb
  ```

## Modelos Actuales

Por ahora el proyecto usa URLs externas de ejemplo. Puedes agregar tus propios modelos aquí.
