/**
 * Auth page - Handles user authentication (login and registration)
 * Provides forms for both signing in and creating new accounts
 */
'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { Palette, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = '/';

  // Verificar el modo (login/register) desde la URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  // Verificar si hay un error de Google OAuth en la URL
  useEffect(() => {
    const googleError = searchParams.get('error');
    if (googleError) {
      setErrors({ submit: decodeURIComponent(googleError) });
      // Limpiar el error de la URL
      router.replace('/auth', { scroll: false });
    }
  }, [searchParams, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        router.push(from);
      } else {
        setErrors({ submit: result.error || 'Error en la autenticación' });
      }
    } catch (error) {
      setErrors({ submit: 'Error inesperado. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-nature-600 to-museum-600">
              <Palette className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-gradient">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isLogin 
              ? 'Accede a tu cuenta para continuar' 
              : 'Únete a nuestra comunidad artística'
            }
          </p>
        </div>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? 'Bienvenido de nuevo' : 'Crear nueva cuenta'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? 'Ingresa tus credenciales para acceder' 
                : 'Completa los datos para registrarte'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Botón de Google OAuth */}
            <div className="mb-6">
              <GoogleLoginButton
                text={isLogin ? 'Iniciar sesión con Google' : 'Registrarse con Google'}
              />

              {/* Texto explicativo contextual */}
              <p className="mt-3 text-xs text-center text-slate-500">
                {isLogin
                  ? 'Accede con tu cuenta de Google institucional'
                  : 'Al continuar con Google, se creará automáticamente tu cuenta si es tu primera vez'
                }
              </p>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">
                    {isLogin ? 'O inicia sesión con email' : 'O regístrate con email'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Tu contraseña"
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmar contraseña
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirma tu contraseña"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading 
                  ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...') 
                  : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-1 text-nature-600 hover:text-nature-700 font-medium"
                >
                  {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                </button>
              </p>
            </div>

            {isLogin && (
              <div className="mt-4 text-center">
                <button className="text-sm text-slate-500 hover:text-slate-700">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;