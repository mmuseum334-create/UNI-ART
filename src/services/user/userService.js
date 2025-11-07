const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Servicio para obtener información de usuarios públicos
 */
export const userService = {
  /**
   * Obtener perfil público de un usuario por su ID
   * @param {string|number} userId - ID del usuario
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getUserProfile(userId) {
    try {
      const token = localStorage.getItem('museum_token');

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al obtener perfil de usuario' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtener las pinturas de un usuario específico
   * @param {string|number} userId - ID del usuario
   * @returns {Promise<{success: boolean, data?: array, error?: string}>}
   */
  async getUserPaintings(userId) {
    try {
      const token = localStorage.getItem('museum_token');

      const response = await fetch(`${API_URL}/users/${userId}/paintings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al obtener pinturas del usuario' };
      }

      return { success: true, data: data.data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Buscar usuarios por nombre
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<{success: boolean, data?: array, error?: string}>}
   */
  async searchUsers(searchTerm) {
    try {
      const token = localStorage.getItem('museum_token');

      const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al buscar usuarios' };
      }

      return { success: true, data: data.data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Actualizar información del usuario
   * @param {string|number} userId - ID del usuario
   * @param {object} data - Datos a actualizar
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async update(userId, data) {
    try {
      const token = localStorage.getItem('museum_token');

      if (!token) {
        return { success: false, error: 'No estás autenticado' };
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.message || 'Error al actualizar usuario' };
      }

      // Actualizar localStorage con los nuevos datos
      const currentUser = JSON.parse(localStorage.getItem('museum_user') || '{}');
      const newUserData = { ...currentUser, ...result };
      localStorage.setItem('museum_user', JSON.stringify(newUserData));

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Actualizar color del usuario
   * @param {string|number} userId - ID del usuario
   * @param {string} color - Color hexadecimal
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async updateColor(userId, color) {
    return this.update(userId, { color });
  },
};
