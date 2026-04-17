const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const getAuthHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('museum_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const bannerService = {
  // ─── GESTIÓN DE CONTENIDO (Admin) ───
  async getByPage(page) {
    try {
      const res = await fetch(`${API_URL}/banner/${page}`, { credentials: 'include' });
      const data = await res.json();
      return res.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },

  async updateContent(page, content) {
    try {
      const res = await fetch(`${API_URL}/banner/${page}/content`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(content),
      });
      const data = await res.json();
      return res.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },

  async updateDesign(page, design) {
    try {
      const res = await fetch(`${API_URL}/banner/${page}/design`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(design),
      });
      const data = await res.json();
      return res.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },

  async update(page, payload) {
    try {
      const res = await fetch(`${API_URL}/banner/${page}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return res.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },

  // ─── GESTIÓN DE MEDIA ───
  async uploadMedia(page, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/banner/${page}/media`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(true),
        body: formData,
      });
      const data = await res.json();
      return res.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },

  async removeMedia(page, index) {
    try {
      const res = await fetch(`${API_URL}/banner/${page}/media/${index}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return res.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },

  async reorderMedia(page, media) {
    try {
      const res = await fetch(`${API_URL}/banner/${page}/media/reorder`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ media }),
      });
      const data = await res.json();
      return res.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },
};
