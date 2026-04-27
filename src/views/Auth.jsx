/**
 * Auth page - Diseño moderno split-screen con glassmorphism
 * Inspirado en artgallery_login_v7_modern con colores del ColorContext
 */
'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useColor } from '@/contexts/ColorContext';
import { useTheme } from '@/contexts/ThemeContext';
import NextImage from 'next/image';
import { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Center, Environment, Lightformer } from '@react-three/drei';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { Eye, EyeOff, ArrowRight, Palette, Users, Image as ImageIcon, Brush, Home, Sun, Moon } from 'lucide-react';

/* ── helpers de color ─────────────────────────────── */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function darken(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  const d = Math.round(255 * amt);
  const clamp = (v) => Math.max(0, Math.min(255, v - d));
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
}

/* ── Escultura 3D Interactiva ── */
function SculptureModel({ mousePos }) {
  const { scene } = useGLTF('/models/escultura-oro.glb');
  const groupRef = useRef(null);

  useFrame(() => {
    // Usamos nuestra propia referencia global en lugar del state.pointer defectuoso por superposición
    const pointer = mousePos?.current || { x: 0, y: 0 };
    // Reducimos la rotación horizontal a ~60 grados (Math.PI / 3)
    const targetX = (pointer.x * Math.PI) / 3;
    // Aumentamos levemente la rotación vertical a ~22.5 grados (Math.PI / 8)
    // para darle un poco más de margen hacia abajo sin exagerar.
    const targetY = (pointer.y * Math.PI) / 8;
    
    if (groupRef.current) {
      // Movimiento suave y responsivo en diagonal (ambos ejes)
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.1;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.1;
      
      // Mantenemos la rotación Z neutral
      groupRef.current.rotation.z = 0;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Center>
          <primitive object={scene} scale={2.5} position={[-2, 0, -2]} />
        </Center>
      </Float>
    </group>
  );
}
// Pre-carga para evitar tiempos de espera
useGLTF.preload('/models/escultura-oro.glb');

/* ── componente principal ─────────────────────────── */
const Auth = () => {
  const mousePos = useRef({ x: 0, y: 0 });

  const handlePointerMove = (e) => {
    // Transformamos las coordenadas a Normalized Device Coordinates (-1 a 1)
    mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [counts, setCounts] = useState({ paintings: '…', sculptures: '…', users: '…' });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorInputRef = useRef(null);

  const { login, register } = useAuth();
  const { color, setColor } = useColor();
  const { isDark, toggleTheme } = useTheme();

  /* colores preset del tema */
  const PRESET_COLORS = [
    { name: 'Azul',    hex: '#328CE7' },
    { name: 'Púrpura', hex: '#A855F7' },
    { name: 'Rosa',    hex: '#EC4899' },
    { name: 'Verde',   hex: '#22C55E' },
    { name: 'Naranja', hex: '#F97316' },
    { name: 'Cyan',    hex: '#06B6D4' },
    { name: 'Rojo',    hex: '#EF4444' },
    { name: 'Ámbar',   hex: '#F59E0B' },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();

  /* cargar conteos reales desde el API */
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const load = async () => {
      try {
        const [paintsRes, sculpturesRes] = await Promise.allSettled([
          fetch(`${API}/paint`),
          fetch(`${API}/sculpture`),
        ]);
        const getValue = async (result) => {
          if (result.status === 'fulfilled' && result.value.ok) {
            const data = await result.value.json();
            return Array.isArray(data) ? data.length : (data?.data?.length ?? '?');
          }
          return '?';
        };
        const [p, s] = await Promise.all([getValue(paintsRes), getValue(sculpturesRes)]);
        // Ya no pedimos /users porque requiere autenticación (evita error 401)
        setCounts({ paintings: p, sculptures: s, users: '+1.2k' });
      } catch {
        setCounts({ paintings: '?', sculptures: '?', users: '+1.2k' });
      }
    };
    load();
  }, []);

  /* colores derivados del color del usuario + tema */
  const c = useMemo(() => {
    const bg       = isDark ? '#0f0f0f' : '#f8fafc';
    const bgPanel  = isDark ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,0.85)';
    const border   = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,0.08)';
    const text1    = isDark ? '#fff'     : '#0f172a';
    const text2    = isDark ? '#9ca3af' : '#475569';
    const text3    = isDark ? '#4b5563' : '#94a3b8';
    const textMute = isDark ? '#374151' : '#94a3b8';
    const cardBg   = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,0.03)';
    const cardBr   = isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,0.07)';
    const inputBg  = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,0.03)';
    const inputBr  = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,0.12)';
    const segBg    = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,0.05)';
    const tabOnBg  = isDark ? '#fff'  : '#fff';
    const tabOnTx  = isDark ? '#111'  : '#111';
    const tabOffTx = isDark ? '#4b5563' : '#64748b';
    const divLine  = isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,0.08)';
    const grid     = isDark
      ? 'linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px)';
    return {
      bg, bgPanel, border, text1, text2, text3, textMute,
      cardBg, cardBr, inputBg, inputBr, segBg,
      tabOnBg, tabOnTx, tabOffTx, divLine, grid,
      main:     color,
      glow1:    rgba(color, isDark ? 0.18 : 0.20),
      glow2:    rgba(color, isDark ? 0.10 : 0.15),
      glow3:    rgba('#ec4899', isDark ? 0.10 : 0.15),
      badge_bg: rgba(color, 0.12),
      badge_br: rgba(color, 0.25),
      badge_tx: isDark ? rgba(color, 0.90) : color,
      dot:      color,
      grad:     `linear-gradient(135deg, ${color}, ${darken(color, -0.15)})`,
      input_fo: rgba(color, 0.60),
      input_bg: rgba(color, 0.08),
      submit:   `linear-gradient(135deg, ${color}, ${darken(color, 0.10)})`,
      forgot:   color,
      foot_lnk: color,
      label:    color,
    };
  }, [color, isDark]);

  /* leer modo desde URL */
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') setIsLogin(false);
    else if (mode === 'login') setIsLogin(true);
  }, [searchParams]);

  /* error de Google OAuth */
  useEffect(() => {
    const googleError = searchParams.get('error');
    if (googleError) {
      setErrors({ submit: decodeURIComponent(googleError) });
      router.replace('/auth', { scroll: false });
    }
  }, [searchParams, router]);

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!isLogin && !formData.name.trim()) e.name = 'El nombre es requerido';
    if (!formData.email.trim()) e.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email inválido';
    if (!formData.password) e.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (!isLogin && formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const result = isLogin
        ? await login(formData.email, formData.password)
        : await register(formData.name, formData.email, formData.password);
      if (result.success) router.push('/');
      else setErrors({ submit: result.error || 'Error en la autenticación' });
    } catch {
      setErrors({ submit: 'Error inesperado. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── estadísticas ─────────────────────────────── */
  const stats = [
    { icon: ImageIcon, n: counts.paintings,  label: 'Pinturas',   iconColor: '#f472b6' },
    { icon: Brush,     n: counts.sculptures, label: 'Esculturas', iconColor: '#34d399' },
    { icon: Users,     n: counts.users,      label: 'Usuarios',   iconColor: c.main    },
  ];

  return (
    <div
      onPointerMove={handlePointerMove}
      className="min-h-screen w-full flex relative overflow-hidden"
      style={{ background: c.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background 0.3s' }}
    >
      {/* ── Escultura 3D WebGL ── */}
      <div className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={isDark ? 0.8 : 1.5} />
          <directionalLight position={[10, 10, 10]} intensity={isDark ? 1.5 : 2} />
          
          {/* Entorno procedural síncrono como fallback (evita que la escultura sea negra por milisegundos) */}
          <Suspense fallback={
            <Environment>
              <Lightformer intensity={2} position={[10, 5, 0]} scale={[50, 50, 1]} target={[0, 0, 0]} />
              <Lightformer intensity={1} position={[-10, -5, 0]} scale={[50, 50, 1]} target={[0, 0, 0]} />
            </Environment>
          }>
            <Environment preset="city" />
          </Suspense>

          <Suspense fallback={null}>
            <SculptureModel mousePos={mousePos} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── glows de fondo ──────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div style={{
          position: 'absolute', width: 600, height: 600,
          background: `radial-gradient(circle, ${c.glow1} 0%, transparent 65%)`,
          top: -100, left: -100,
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          background: `radial-gradient(circle, ${c.glow3} 0%, transparent 65%)`,
          bottom: 0, left: 200,
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          background: `radial-gradient(circle, ${c.glow2} 0%, transparent 65%)`,
          top: '50%', right: '30%',
        }} />
        {/* grid sutil */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: c.grid,
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* input color nativo invisible — montado fuera del flujo */}
      <input
        ref={colorInputRef}
        type="color"
        value={color.startsWith('linear') ? '#22c55e' : color}
        onChange={e => setColor(e.target.value)}
        style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: 0, height: 0, border: 'none', padding: 0 }}
        tabIndex={-1}
        aria-hidden
      />

      {/* ── panel izquierdo ─────────────────────── */}
      <div className="relative z-10 hidden lg:flex flex-1 flex-col justify-between p-12">
        {/* Logo + controles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NextImage
              src="/logoverdee.png"
              alt="UniArt logo"
              width={58}
              height={58}
              style={{ borderRadius: 10, objectFit: 'contain' }}
              priority
            />
            <span style={{ fontSize: 17, fontWeight: 700, color: c.text1, letterSpacing: '-0.3px' }}>
              UniArt
            </span>
          </div>

          {/* acciones del header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* ── selector de color ── */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowColorPicker(p => !p)}
                title="Personalizar color del tema"
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: c.cardBg, border: `1px solid ${showColorPicker ? color : c.cardBr}`,
                  borderRadius: 10, padding: '7px 12px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 500, color: c.text2,
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = c.text1; }}
                onMouseLeave={e => { if (!showColorPicker) { e.currentTarget.style.borderColor = c.cardBr; } e.currentTarget.style.color = c.text2; }}
              >
                <span style={{
                  width: 12, height: 12, borderRadius: '50%', background: color,
                  boxShadow: `0 0 0 2px ${rgba(color, 0.35)}`, flexShrink: 0,
                }} />
                Color
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
                  <path d={showColorPicker ? 'M1 7l4-4 4 4' : 'M1 3l4 4 4-4'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showColorPicker && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowColorPicker(false)} />
                  <div style={{
                    position: 'absolute', left: 0, top: 'calc(100% + 10px)', zIndex: 50,
                    background: isDark ? 'rgba(13,13,18,0.98)' : 'rgba(255,255,255,0.99)',
                    border: `1px solid ${c.cardBr}`,
                    borderRadius: 16, padding: 16,
                    boxShadow: `0 24px 64px rgba(0,0,0,${isDark ? 0.6 : 0.18})`,
                    backdropFilter: 'blur(20px)',
                    minWidth: 232,
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: c.text3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                      Color del tema
                    </p>
                    {/* swatches */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginBottom: 14 }}>
                      {PRESET_COLORS.map(({ name, hex }) => (
                        <button
                          key={hex}
                          title={name}
                          onClick={() => { setColor(hex); setShowColorPicker(false); }}
                          style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: hex, border: 'none', cursor: 'pointer', padding: 0,
                            outline: color === hex ? `3px solid ${hex}` : '2px solid transparent',
                            outlineOffset: 2,
                            transform: color === hex ? 'scale(1.25)' : 'scale(1)',
                            transition: 'transform .15s, outline .15s',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.25)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = color === hex ? 'scale(1.25)' : 'scale(1)'; }}
                        />
                      ))}
                    </div>
                    {/* personalizado */}
                    <div
                      onClick={() => colorInputRef.current?.click()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: c.inputBg, border: `1px solid ${c.inputBr}`,
                        borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
                        transition: 'border-color .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = c.inputBr; }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: 6, background: color, flexShrink: 0,
                        boxShadow: `0 0 0 2px ${rgba(color, 0.35)}`,
                      }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: c.text2, flex: 1 }}>
                        {color.startsWith('linear') ? 'Personalizado' : color.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 10, color: c.text3 }}>✎</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── toggle tema dark/light ── */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34,
                background: c.cardBg, border: `1px solid ${c.cardBr}`,
                borderRadius: 10, cursor: 'pointer',
                color: c.text2, transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.main; e.currentTarget.style.color = c.text1; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = c.cardBr; e.currentTarget.style.color = c.text2; }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* ── volver al inicio ── */}
            <button
              onClick={() => router.push('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: c.cardBg, border: `1px solid ${c.cardBr}`,
                borderRadius: 10, padding: '7px 14px',
                fontSize: 12, fontWeight: 500, color: c.text2,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = c.text1; e.currentTarget.style.borderColor = c.main; }}
              onMouseLeave={e => { e.currentTarget.style.color = c.text2; e.currentTarget.style.borderColor = c.cardBr; }}
            >
              <Home size={14} />
              Home
            </button>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ maxWidth: 420 }}>
          {/* badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: c.badge_bg,
            border: `1px solid ${c.badge_br}`,
            borderRadius: 100, padding: '5px 14px',
            fontSize: 11, fontWeight: 500, color: c.badge_tx,
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, background: c.dot, borderRadius: '50%', display: 'inline-block' }} />
            Plataforma de arte digital
          </div>

          {/* headline */}
          <h1 style={{
            fontSize: 52, fontWeight: 700, color: c.text1,
            lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 20,
          }}>
            Tu arte.<br />
            Tu{' '}
            <span style={{
              backgroundImage: c.grad,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              display: 'inline',
            }}>
              mundo.
            </span>
            <br />
            Tu comunidad.
          </h1>

          <p style={{ fontSize: 15, color: c.text2, lineHeight: 1.7, marginBottom: 40 }}>
            Únete a nuestra comunidad de artistas y coleccionistas. Explora obras únicas y comparte tu visión con el mundo.
          </p>

          {/* stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
            {stats.map(({ icon: Icon, n, label, iconColor }) => (
              <div key={label} style={{
                background: c.cardBg,
                border: `1px solid ${c.cardBr}`,
                borderRadius: 16, padding: 16,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: rgba(iconColor, 0.18),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Icon style={{ width: 16, height: 16, color: iconColor }} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.text1, letterSpacing: '-1px' }}>{n}</div>
                <div style={{ fontSize: 11, color: c.text3, fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── panel derecho (formulario) ───────────── */}
      <div
        className="relative z-10 w-full lg:w-[420px] flex flex-col justify-center px-8 py-12 lg:px-10"
        style={{
          background: c.bgPanel,
          borderLeft: `1px solid ${c.border}`,
          backdropFilter: isDark ? 'none' : 'blur(12px)',
        }}
      >
        {/* logo mobile */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: c.grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Palette className="h-4 w-4 text-white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: c.text1 }}>UniArt</span>
        </div>

        {/* título */}
        <div style={{ fontSize: 11, fontWeight: 600, color: c.label, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
          Bienvenido
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: c.text1, letterSpacing: '-0.8px', marginBottom: 4, lineHeight: 1.1 }}>
          {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
        </div>
        <div style={{ fontSize: 13, color: c.text2, marginBottom: 28 }}>
          {isLogin ? 'Ingresa a tu cuenta para explorar' : 'Únete a miles de artistas'}
        </div>

        {/* tabs */}
        <div style={{
          display: 'flex', background: c.segBg,
          borderRadius: 12, padding: 4, gap: 4, marginBottom: 28,
        }}>
          {[
            { label: 'Iniciar sesión', active: isLogin,  onClick: () => switchMode(true) },
            { label: 'Registrarse',   active: !isLogin, onClick: () => switchMode(false) },
          ].map(({ label, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                flex: 1, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 500,
                padding: '9px', borderRadius: 9,
                background: active ? c.tabOnBg : 'transparent',
                color: active ? c.tabOnTx : c.tabOffTx,
                transition: 'all .2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Google */}
        <div style={{ marginBottom: 20 }}>
          <GoogleLoginButton
            text={isLogin ? 'Continuar con Google' : 'Registrarse con Google'}
          />
        </div>

        {/* divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: c.divLine }} />
          <span style={{ fontSize: 11, color: c.textMute, fontWeight: 500 }}>o con email</span>
          <div style={{ flex: 1, height: 1, background: c.divLine }} />
        </div>

        {/* formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* nombre (solo registro) */}
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: c.text2, marginBottom: 7 }}>
                Nombre completo
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                style={{
                  width: '100%',
                  background: errors.name ? 'rgba(239,68,68,.08)' : c.inputBg,
                  border: `1px solid ${errors.name ? 'rgba(239,68,68,.6)' : c.inputBr}`,
                  borderRadius: 12, color: c.text1, padding: '12px 16px',
                  fontFamily: 'inherit', fontSize: 14, outline: 'none', transition: 'all .2s',
                }}
                onFocus={e => { e.target.style.borderColor = c.main; }}
                onBlur={e  => { e.target.style.borderColor = errors.name ? 'rgba(239,68,68,.6)' : c.inputBr; }}
              />
              {errors.name && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
            </div>
          )}

          {/* email */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: c.text2, marginBottom: 7 }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              style={{
                width: '100%',
                background: errors.email ? 'rgba(239,68,68,.08)' : c.inputBg,
                border: `1px solid ${errors.email ? 'rgba(239,68,68,.6)' : c.inputBr}`,
                borderRadius: 12, color: c.text1, padding: '12px 16px',
                fontFamily: 'inherit', fontSize: 14, outline: 'none', transition: 'all .2s',
              }}
              onFocus={e => { e.target.style.borderColor = c.main; }}
              onBlur={e  => { e.target.style.borderColor = errors.email ? 'rgba(239,68,68,.6)' : c.inputBr; }}
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
          </div>

          {/* contraseña */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: c.text2, marginBottom: 7 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: errors.password ? 'rgba(239,68,68,.08)' : c.inputBg,
                  border: `1px solid ${errors.password ? 'rgba(239,68,68,.6)' : c.inputBr}`,
                  borderRadius: 12, color: c.text1, padding: '12px 44px 12px 16px',
                  fontFamily: 'inherit', fontSize: 14, outline: 'none', transition: 'all .2s',
                }}
                onFocus={e => { e.target.style.borderColor = c.main; }}
                onBlur={e  => { e.target.style.borderColor = errors.password ? 'rgba(239,68,68,.6)' : c.inputBr; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#4b5563',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.password}</p>}
          </div>

          {/* confirmar contraseña (solo registro) */}
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: c.text2, marginBottom: 7 }}>
                Confirmar contraseña
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: errors.confirmPassword ? 'rgba(239,68,68,.08)' : c.inputBg,
                  border: `1px solid ${errors.confirmPassword ? 'rgba(239,68,68,.6)' : c.inputBr}`,
                  borderRadius: 12, color: c.text1, padding: '12px 16px',
                  fontFamily: 'inherit', fontSize: 14, outline: 'none', transition: 'all .2s',
                }}
                onFocus={e => { e.target.style.borderColor = c.main; }}
                onBlur={e  => { e.target.style.borderColor = errors.confirmPassword ? 'rgba(239,68,68,.6)' : c.inputBr; }}
              />
              {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.confirmPassword}</p>}
            </div>
          )}

          {/* recordarme / olvidé contraseña (solo login) */}
          {isLogin && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" style={{
                  width: 16, height: 16,
                  background: c.inputBg,
                  border: `1px solid ${c.inputBr}`,
                  borderRadius: 5, cursor: 'pointer', appearance: 'none',
                }} />
                <span style={{ fontSize: 12, color: c.text2, fontWeight: 500 }}>Recordarme</span>
              </label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 12, color: c.forgot, fontWeight: 500, cursor: 'pointer' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* error general */}
          {errors.submit && (
            <div style={{
              background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <p style={{ fontSize: 12, color: '#ef4444' }}>{errors.submit}</p>
            </div>
          )}

          {/* submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', background: isLoading ? 'rgba(255,255,255,.1)' : c.submit,
              border: 'none', borderRadius: 12, color: '#fff', padding: '14px',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer', letterSpacing: '-0.2px',
              transition: 'opacity .2s', marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span>
              {isLoading
                ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...')
                : (isLogin ? 'Iniciar sesión' : 'Crear cuenta gratis')}
            </span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: c.text2 }}>
          <span>{isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}</span>{' '}
          <button
            onClick={() => switchMode(!isLogin)}
            style={{
              background: 'none', border: 'none', fontFamily: 'inherit',
              fontSize: 12, color: c.foot_lnk, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;