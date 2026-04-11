const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('museum_token');
  }
  return null;
};

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const categoryService = {
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/categories`, { headers: getHeaders() });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al obtener categorías' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, { headers: getHeaders() });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al obtener categoría' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  async create(categoryData) {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al crear categoría' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  async update(id, categoryData) {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al actualizar categoría' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al eliminar categoría' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },
};
