/**
 * Sculpture Service - Manejo de peticiones HTTP para esculturas
 * Conecta el frontend con el backend NestJS para gestión de esculturas y modelos 3D
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Obtiene el token de autenticación del localStorage
 */
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('museum_token');
  }
  return null;
};

/**
 * Configuración de headers para las peticiones
 * @param {boolean} isFormData - Si es true, no incluye Content-Type para FormData
 */
const getHeaders = (isFormData = false) => {
  const headers = {};

  // No agregar Content-Type para FormData (el browser lo agrega automáticamente con boundary)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const sculptureService = {
  /**
   * Crear una nueva escultura
   * @param {FormData} sculptureFormData - FormData con los datos de la escultura (incluyendo 20-50 imágenes)
   * @returns {Promise<Object>} Respuesta con la escultura creada
   */
  async create(sculptureFormData) {
    try {
      const response = await fetch(`${API_URL}/sculpture`, {
        method: 'POST',
        headers: getHeaders(true), // true = no incluir Content-Type (FormData lo maneja)
        body: sculptureFormData, // Enviar FormData directamente
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error del backend:', data);
        return {
          success: false,
          error: data.message || data.error || 'Error al crear la escultura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.create:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Regenerate 3D model for an existing sculpture
   * @param {number|string} id - ID de la escultura
   * @returns {Promise<Object>} Respuesta con la escultura actualizada
   */
  async regenerateModel(id) {
    try {
      const response = await fetch(`${API_URL}/sculpture/${id}/regenerate`, {
        method: 'POST',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al regenerar el modelo 3D'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.regenerateModel:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener todas las esculturas
   * @returns {Promise<Object>} Respuesta con lista de esculturas
   */
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/sculpture`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener las esculturas'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.getAll:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener una escultura por ID
   * @param {number} id - ID de la escultura
   * @returns {Promise<Object>} Respuesta con la escultura
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/sculpture/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener la escultura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.getById:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener el estado de procesamiento del modelo 3D
   * @param {number} id - ID de la escultura
   * @returns {Promise<Object>} Respuesta con el estado de procesamiento
   */
  async getProcessingStatus(id) {
    try {
      const response = await fetch(`${API_URL}/sculpture/${id}/status`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener el estado de procesamiento'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.getProcessingStatus:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener esculturas por artista
   * @param {string} artista - Nombre del artista
   * @returns {Promise<Object>} Respuesta con lista de esculturas
   */
  async getByArtist(artista) {
    try {
      const response = await fetch(`${API_URL}/sculpture/artist?nombre=${encodeURIComponent(artista)}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener esculturas del artista'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.getByArtist:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener esculturas del usuario actual autenticado
   * @returns {Promise<Object>} Respuesta con lista de esculturas del usuario
   */
  async getMySculptures() {
    try {
      const response = await fetch(`${API_URL}/sculpture/my-sculptures`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener tus esculturas'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.getMySculptures:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener esculturas por categoría
   * @param {string} categoria - Categoría de la escultura
   * @returns {Promise<Object>} Respuesta con lista de esculturas
   */
  async getByCategory(categoria) {
    try {
      const response = await fetch(`${API_URL}/sculpture/category?nombre=${encodeURIComponent(categoria)}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener esculturas por categoría'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.getByCategory:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Actualizar una escultura
   * @param {number} id - ID de la escultura
   * @param {FormData|Object} sculptureData - FormData (si incluye imágenes) u Object (si solo texto)
   * @returns {Promise<Object>} Respuesta con la escultura actualizada
   */
  async update(id, sculptureData) {
    try {
      const isFormData = sculptureData instanceof FormData;

      const response = await fetch(`${API_URL}/sculpture/${id}`, {
        method: 'PATCH',
        headers: getHeaders(isFormData),
        body: isFormData ? sculptureData : JSON.stringify(sculptureData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al actualizar la escultura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.update:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Eliminar una escultura (soft delete)
   * @param {number} id - ID de la escultura
   * @returns {Promise<Object>} Respuesta con mensaje de éxito
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/sculpture/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al eliminar la escultura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.delete:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Restaurar una escultura eliminada
   * @param {number} id - ID de la escultura
   * @returns {Promise<Object>} Respuesta con la escultura restaurada
   */
  async restore(id) {
    try {
      const response = await fetch(`${API_URL}/sculpture/${id}/restore`, {
        method: 'POST',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al restaurar la escultura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en sculptureService.restore:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },
};
