const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al iniciar sesión' };
      }

      // Guardar token
      if (data.token) {
        localStorage.setItem('museum_token', data.token);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Register
  async register(name, email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al registrar usuario' };
      }

      // Guardar token si viene en la respuesta
      if (data.token) {
        localStorage.setItem('museum_token', data.token);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get token
  getToken() {
    return localStorage.getItem('museum_token');
  },

  // Logout
  logout() {
    localStorage.removeItem('museum_token');
    localStorage.removeItem('museum_user');
  },
};
