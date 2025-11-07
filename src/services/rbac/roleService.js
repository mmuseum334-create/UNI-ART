/**
 * Role Service - Manejo de roles y permisos
 * Sistema RBAC (Role-Based Access Control)
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
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const roleService = {
  /**
   * Obtener todos los roles del sistema
   * @returns {Promise<Object>} Lista de roles
   */
  async getAllRoles() {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener roles'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.getAllRoles:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener un rol por ID con sus permisos
   * @param {number} roleId - ID del rol
   * @returns {Promise<Object>} Rol con sus permisos
   */
  async getRoleById(roleId) {
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener rol'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.getRoleById:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Crear un nuevo rol
   * @param {Object} roleData - Datos del rol { name, description }
   * @returns {Promise<Object>} Rol creado
   */
  async createRole(roleData) {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(roleData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al crear rol'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.createRole:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Actualizar un rol existente
   * @param {number} roleId - ID del rol
   * @param {Object} roleData - Datos a actualizar { name, description }
   * @returns {Promise<Object>} Rol actualizado
   */
  async updateRole(roleId, roleData) {
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(roleData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al actualizar rol'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.updateRole:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Eliminar un rol
   * @param {number} roleId - ID del rol
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteRole(roleId) {
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al eliminar rol'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.deleteRole:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Asignar permisos a un rol
   * @param {number} roleId - ID del rol
   * @param {Array<Object>} permissions - Array de permisos { resource, canView, canCreate, canEdit, canDelete }
   * @returns {Promise<Object>} Resultado de la asignación
   */
  async assignPermissions(roleId, permissions) {
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ permissions }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al asignar permisos'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.assignPermissions:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener todos los recursos disponibles (vistas/módulos del sistema)
   * @returns {Promise<Object>} Lista de recursos
   */
  async getAvailableResources() {
    try {
      const response = await fetch(`${API_URL}/roles/resources`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener recursos'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.getAvailableResources:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Asignar rol a un usuario
   * @param {number} userId - ID del usuario
   * @param {number} roleId - ID del rol
   * @returns {Promise<Object>} Resultado de la asignación
   */
  async assignRoleToUser(userId, roleId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ roleId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al asignar rol al usuario'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.assignRoleToUser:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener todos los usuarios con sus roles
   * @returns {Promise<Object>} Lista de usuarios con roles
   */
  async getAllUsers() {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener usuarios'
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en roleService.getAllUsers:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },
};
