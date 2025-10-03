# 🎨 Museum - Galería de Arte Digital con AR

Plataforma web de galería de arte con capacidades de visualización en Realidad Aumentada usando WebXR.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 15.5.4 (App Router)
- **UI:** React 19 + Tailwind CSS 3.4
- **3D/AR:** Three.js + WebXR
- **Iconos:** Lucide React
- **Backend (futuro):** NestJS

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone <tu-repo-url>
cd museum

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
museum/
├── app/                      # Next.js App Router
│   ├── layout.jsx           # Layout raíz con providers
│   ├── page.jsx             # Página de inicio
│   ├── catalog/             # Catálogo de obras
│   ├── ar/                  # Experiencia AR
│   ├── auth/                # Autenticación
│   ├── profile/             # Perfil de usuario
│   ├── upload/              # Subir obras
│   └── artwork/[id]/        # Detalle de obra (ruta dinámica)
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── layout/         # Navbar, Footer
│   │   ├── ui/             # Button, Card, Input, etc.
│   │   └── ar/             # ARViewer
│   ├── contexts/           # Context API (Auth, Theme)
│   ├── pages/              # Lógica de páginas
│   ├── lib/                # Utilidades
│   ├── data/               # Data mock
│   └── assets/             # Imágenes, recursos
├── public/                  # Archivos estáticos
├── next.config.js          # Configuración Next.js
├── tailwind.config.js      # Configuración Tailwind
└── jsconfig.json           # Alias de importación (@/)
```

## 🎯 Características

- ✅ **Galería de Arte:** Exploración de obras con filtros y búsqueda
- ✅ **Realidad Aumentada:** Visualización de obras en AR usando WebXR
- ✅ **Autenticación:** Sistema de login/registro (mock, pendiente backend)
- ✅ **Dark Mode:** Tema oscuro/claro con persistencia
- ✅ **Responsive:** Diseño adaptativo para móvil/tablet/desktop
- ✅ **Optimización:** Server Components + Client Components de Next.js

## 🧩 Componentes Principales

### Pages
- **Home (`/`):** Página principal con obras destacadas
- **Catalog (`/catalog`):** Catálogo completo con filtros
- **AR (`/ar`):** Experiencia de Realidad Aumentada
- **Auth (`/auth`):** Login y registro
- **Profile (`/profile`):** Perfil del usuario
- **Upload (`/upload`):** Subir nueva obra
- **Artwork Detail (`/artwork/[id]`):** Detalle de obra individual

### Contexts
- **AuthContext:** Manejo de autenticación global
- **ThemeContext:** Manejo de tema (dark/light mode)

## 🎨 Sistema de Diseño

### Paleta de Colores

```js
// Primarios
museum: '#0ea5e9' (azul)
nature: '#22c55e' (verde)

// Dark Mode
dark-primary: '#0f0f0f'
dark-secondary: '#0a0a0a'
dark-tertiary: '#181818'
```

### Fuentes
- **Display/Sans:** Poppins (Google Fonts)

## 📜 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo (port 3000)
npm run build    # Build de producción
npm start        # Servidor de producción
npm run lint     # Linting con ESLint
```

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local` en la raíz:

```env
# API Backend (cuando esté disponible)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Otras variables...
```

### Alias de Importación

El proyecto usa alias `@/` para imports:

```jsx
// ✅ Correcto
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

// ❌ Evitar
import { Button } from '../../components/ui/Button';
```

## 🚧 Roadmap / TODOs

### Backend Integration (NestJS)
- [ ] Crear backend NestJS
- [ ] Implementar autenticación JWT
- [ ] API REST para obras de arte
- [ ] Base de datos (PostgreSQL/MongoDB)
- [ ] Upload de imágenes (Cloudinary/S3)

### Frontend
- [ ] Optimizar imágenes con `next/image`
- [ ] Implementar ISR (Incremental Static Regeneration)
- [ ] Agregar loading states (`loading.jsx`)
- [ ] Error boundaries (`error.jsx`)
- [ ] Tests (Jest + React Testing Library)
- [ ] Sitemap y SEO optimizations

### Features
- [ ] Sistema de comentarios
- [ ] Favoritos y colecciones
- [ ] Compartir en redes sociales
- [ ] Notificaciones push
- [ ] Sistema de búsqueda avanzada

## 📚 Documentación Adicional

- [MIGRATION.md](./MIGRATION.md) - Documentación de migración desde Vite
- [AR_README.md](./AR_README.md) - Guía de WebXR y AR

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está bajo [Licencia que elijas].

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial*

## 🙏 Agradecimientos

- Next.js Team
- Tailwind CSS
- Three.js Community
- Lucide Icons

---

**Proyecto migrado exitosamente de Vite a Next.js 🎉**

Para más información sobre la migración, ver [MIGRATION.md](./MIGRATION.md)
