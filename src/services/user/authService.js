const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Dominios institucionales permitidos
 * Configura aquí los dominios de correo que pueden registrarse
 */
const INSTITUTIONAL_DOMAINS = [
  'unipaz.edu.co',
  'estudiantes.unipaz.edu.co',
  // Agregar más dominios institucionales aquí
];

/**
 * Valida si un correo es institucional
 * @param {string} email - Correo a validar
 * @returns {boolean}
 */
const isInstitutionalEmail = (email) => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return INSTITUTIONAL_DOMAINS.includes(domain);
};

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al iniciar sesión' };
      }

      // El backend usa sesiones (cookie), guardamos el userId como token para el AuthContext
      const token = data.token || (data.user?.id ? String(data.user.id) : null);
      if (token) {
        localStorage.setItem('museum_token', token);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Register
  async register(name, email, password) {
    try {
      // Validar correo institucional
      if (!isInstitutionalEmail(email)) {
        return {
          success: false,
          error: 'Debes usar un correo institucional (@unipaz.edu.co)'
        };
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
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

  // Validar si un correo es institucional (export para uso externo)
  isInstitutionalEmail,

  // Obtener dominios institucionales permitidos
  getInstitutionalDomains() {
    return INSTITUTIONAL_DOMAINS;
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
