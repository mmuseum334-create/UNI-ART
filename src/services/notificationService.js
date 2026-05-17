/**
 * Notification Service - Maneja las notificaciones del usuario
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('museum_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const notificationService = {
  /** Obtener todas mis notificaciones */
  async getAll() {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },

  /** Obtener el conteo de no leídas */
  async getUnreadCount() {
    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, count: 0 };
      return { success: true, count: data.count };
    } catch {
      return { success: false, count: 0 };
    }
  },

  /** Marcar todas como leídas */
  async markAllRead() {
    try {
      const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },

  /** Marcar una notificación como leída */
  async markRead(id) {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  },
};
