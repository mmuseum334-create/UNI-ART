/**
 * Paint Service - Manejo de peticiones HTTP para pinturas
 * Conecta el frontend con el backend NestJS
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

export const paintService = {
  /**
   * Crear una nueva pintura
   * @param {FormData} paintFormData - FormData con los datos de la pintura (incluyendo archivo)
   * @returns {Promise<Object>} Respuesta con la pintura creada
   */
  async create(paintFormData) {
    try {
      const response = await fetch(`${API_URL}/paint`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(true),
        body: paintFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al crear la pintura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.create:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener todas las pinturas
   * @returns {Promise<Object>} Respuesta con lista de pinturas
   */
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/paint`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener las pinturas'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.getAll:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener una pintura por ID
   * @param {number} id - ID de la pintura
   * @returns {Promise<Object>} Respuesta con la pintura
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/paint/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener la pintura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.getById:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener pinturas por artista
   * @param {string} artista - Nombre del artista
   * @returns {Promise<Object>} Respuesta con lista de pinturas
   */
  async getByArtist(artista) {
    try {
      const response = await fetch(`${API_URL}/paint/artist/${artista}`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener pinturas del artista'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.getByArtist:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener pinturas del usuario actual autenticado
   * Usa el endpoint de /paint/my-paintings que está protegido con JWT y devuelve las pinturas del usuario logueado
   * @returns {Promise<Object>} Respuesta con lista de pinturas del usuario
   */
  async getMyPaintings() {
    try {
      const response = await fetch(`${API_URL}/paint/my-paintings`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener tus pinturas'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.getMyPaintings:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener pinturas por categoría
   * @param {string} categoria - Categoría de la pintura
   * @returns {Promise<Object>} Respuesta con lista de pinturas
   */
  async getByCategory(categoria) {
    try {
      const response = await fetch(`${API_URL}/paint/category/${categoria}`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener pinturas por categoría'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.getByCategory:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Actualizar una pintura
   * @param {number} id - ID de la pintura
   * @param {FormData|Object} paintData - FormData (si incluye imagen) u Object (si solo texto)
   * @returns {Promise<Object>} Respuesta con la pintura actualizada
   */
  async update(id, paintData) {
    try {
      const isFormData = paintData instanceof FormData;

      const response = await fetch(`${API_URL}/paint/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(isFormData),
        body: isFormData ? paintData : JSON.stringify(paintData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al actualizar la pintura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.update:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Eliminar una pintura (soft delete)
   * @param {number} id - ID de la pintura
   * @returns {Promise<Object>} Respuesta con mensaje de éxito
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/paint/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al eliminar la pintura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.delete:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Restaurar una pintura eliminada
   * @param {number} id - ID de la pintura
   * @returns {Promise<Object>} Respuesta con la pintura restaurada
   */
  async restore(id) {
    try {
      const response = await fetch(`${API_URL}/paint/restore/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al restaurar la pintura'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en paintService.restore:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },
};

