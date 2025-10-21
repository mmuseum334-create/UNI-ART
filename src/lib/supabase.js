/**
 * Supabase Client Configuration
 * Configuración del cliente de Supabase para acceder al storage de imágenes
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Crear cliente de Supabase solo si las credenciales están disponibles
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not found in environment variables');
}

/**
 * Obtiene la URL pública de una imagen desde Supabase Storage
 * @param {string} path - Path de la imagen en Supabase (ej: "paintings/imagen.jpg")
 * @returns {string|null} URL pública de la imagen o null si no hay cliente configurado
 */
export const getPublicImageUrl = (path) => {
  if (!supabase || !path) return null;

  // Si el path ya es una URL completa, retornarla tal cual
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Eliminar el slash inicial si existe
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Obtener URL pública del storage
  const { data } = supabase.storage
    .from('Paint') // Nombre del bucket en Supabase
    .getPublicUrl(cleanPath);

  return data?.publicUrl || null;
};

/**
 * Sube una imagen a Supabase Storage
 * @param {File} file - Archivo de imagen a subir
 * @param {string} folder - Carpeta destino (ej: "paintings")
 * @returns {Promise<Object>} Respuesta con el path de la imagen subida
 */
export const uploadImage = async (file, folder = 'paintings') => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase no está configurado'
    };
  }

  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Subir archivo a Supabase
    const { data, error } = await supabase.storage
      .from('Paint')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      path: data.path,
      url: getPublicImageUrl(data.path)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} path - Path de la imagen a eliminar
 * @returns {Promise<Object>} Respuesta con el resultado de la operación
 */
export const deleteImage = async (path) => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase no está configurado'
    };
  }

  try {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const { error } = await supabase.storage
      .from('Paint')
      .remove([cleanPath]);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default supabase;
