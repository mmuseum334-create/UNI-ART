# Configuración de Supabase para Imágenes

Este documento explica cómo configurar Supabase para almacenar y servir las imágenes de las pinturas.

## ¿Por qué Supabase?

Supabase proporciona almacenamiento de archivos escalable y seguro con URLs públicas para las imágenes, lo que es ideal para una aplicación de museo virtual.

## Pasos de Configuración

### 1. Crear una cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### 2. Obtener las credenciales

Una vez creado el proyecto:

1. Ve a **Settings** > **API** en el panel de Supabase
2. Copia los siguientes valores:
   - **Project URL** (URL del proyecto)
   - **anon public** key (Clave pública anónima)

### 3. Configurar el archivo .env.local

Actualiza el archivo `.env.local` en la raíz del proyecto con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-anonima
```

**Importante:** Reemplaza los valores de ejemplo con tus credenciales reales.

### 4. Crear el bucket de storage

1. En el panel de Supabase, ve a **Storage**
2. Crea un nuevo bucket llamado `museum-paintings`
3. Configura el bucket como **público** para permitir el acceso a las imágenes

### 5. Configurar políticas de acceso (RLS)

Para el bucket `museum-paintings`, configura las siguientes políticas:

#### Política de lectura pública (SELECT)
```sql
-- Permitir lectura pública de todas las imágenes
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'museum-paintings');
```

#### Política de subida (INSERT)
```sql
-- Permitir subida de imágenes a usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'museum-paintings');
```

#### Política de actualización (UPDATE)
```sql
-- Permitir actualización de imágenes propias
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'museum-paintings' AND auth.uid() = owner);
```

#### Política de eliminación (DELETE)
```sql
-- Permitir eliminación de imágenes propias
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'museum-paintings' AND auth.uid() = owner);
```

### 6. Reiniciar el servidor de desarrollo

Después de actualizar las variables de entorno:

```bash
npm run dev
```

## Estructura de Archivos en Supabase

Las imágenes se organizarán de la siguiente manera:

```
museum-paintings/
  └── paintings/
      ├── 1234567890-abc123.jpg
      ├── 1234567891-def456.png
      └── ...
```

Cada archivo tiene un nombre único generado automáticamente para evitar colisiones.

## Uso en el Código

El servicio de Supabase (`src/lib/supabase.js`) proporciona funciones útiles:

### Obtener URL pública de una imagen

```javascript
import { getPublicImageUrl } from '@/lib/supabase';

const imageUrl = getPublicImageUrl('paintings/imagen.jpg');
```

### Subir una imagen

```javascript
import { uploadImage } from '@/lib/supabase';

const result = await uploadImage(file, 'paintings');
if (result.success) {
  console.log('URL de la imagen:', result.url);
}
```

### Eliminar una imagen

```javascript
import { deleteImage } from '@/lib/supabase';

const result = await deleteImage('paintings/imagen.jpg');
```

## Verificación

Para verificar que todo funciona correctamente:

1. Sube una pintura usando el formulario de Upload
2. Ve al catálogo y verifica que la imagen se muestra correctamente
3. Haz clic en la pintura para ver los detalles
4. En el panel de Supabase, ve a **Storage** > **museum-paintings** y verifica que la imagen se ha subido

## Solución de Problemas

### Las imágenes no se muestran

1. Verifica que las credenciales en `.env.local` sean correctas
2. Asegúrate de que el bucket `museum-paintings` existe y es público
3. Verifica que las políticas de RLS estén configuradas correctamente
4. Revisa la consola del navegador para ver errores

### Error al subir imágenes

1. Verifica que el usuario esté autenticado
2. Asegúrate de que la política de INSERT permite la subida
3. Verifica que el tamaño del archivo no supere el límite (por defecto 5MB)

### Imágenes con URLs del backend local

Si ves URLs como `http://localhost:3002/uploads/...`, significa que:
- Las imágenes se están guardando en el backend local en lugar de Supabase
- Las credenciales de Supabase no están configuradas o son incorrectas
- El backend debe configurarse para usar Supabase en lugar del sistema de archivos local

## Migración de Imágenes Existentes

Si ya tienes imágenes en el servidor local (`uploads/`), puedes migrarlas manualmente:

1. Descarga las imágenes del servidor local
2. Súbelas al bucket de Supabase usando el panel web o la API
3. Actualiza los paths en la base de datos para que apunten a las nuevas ubicaciones en Supabase

## Notas de Seguridad

- **NO** compartas tus credenciales de Supabase públicamente
- **NO** subas el archivo `.env.local` al repositorio
- Usa la clave **anon public** para el frontend (no uses la service_role key)
- Las políticas RLS protegen el acceso a los recursos

## Recursos Adicionales

- [Documentación de Supabase Storage](https://supabase.com/docs/guides/storage)
- [Políticas de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SDK de JavaScript](https://supabase.com/docs/reference/javascript/introduction)
