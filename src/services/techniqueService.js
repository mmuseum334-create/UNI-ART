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

export const techniqueService = {
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/techniques`, { headers: getHeaders() });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al obtener técnicas' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/techniques/${id}`, { headers: getHeaders() });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al obtener técnica' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  async create(techniqueData) {
    try {
      const response = await fetch(`${API_URL}/techniques`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(techniqueData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al crear técnica' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  async update(id, techniqueData) {
    try {
      const response = await fetch(`${API_URL}/techniques/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(techniqueData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al actualizar técnica' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/techniques/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Error al eliminar técnica' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },
};
