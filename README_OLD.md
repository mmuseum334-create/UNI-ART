# 🎨 Museo Virtual

Un museo virtual moderno y elegante construido con React, TailwindCSS y tecnologías web actuales. Permite a los usuarios explorar, descubrir y compartir diferentes formas de arte digital.

## ✨ Características

### 🏛️ Funcionalidades Principales
- **Catálogo Completo**: Navegación por diferentes categorías de arte (poemas, canciones, videos, pinturas, imágenes, esculturas y otros)
- **Sistema de Búsqueda Avanzado**: Filtros por categoría, ordenamiento y búsqueda por texto
- **Feed Dinámico**: Página principal con obras destacadas y categorías
- **Perfiles de Usuario**: Gestión de perfil personal con estadísticas
- **Subida de Contenido**: Formularios intuitivos para artistas

### 🔐 Sistema de Autenticación
- **Registro e Inicio de Sesión**: Sistema completo de autenticación
- **Roles de Usuario**: Diferenciación entre visitantes y artistas registrados
- **Persistencia**: Los datos se almacenan localmente

### 🎭 Categorías de Arte Soportadas
- 📝 **Poemas**: Textos líricos con visualización especial
- 🎵 **Canciones**: Con reproductor de audio y letras
- 🎬 **Videos**: Reproductor integrado con miniaturas
- 🖼️ **Pinturas**: Galería de imágenes con detalles técnicos
- 📸 **Imágenes**: Fotografías y arte digital
- 🗿 **Esculturas**: Arte tridimensional con especificaciones
- ✨ **Otros**: Instalaciones, arte digital, etc.

### 🎨 Diseño y UX
- **Paleta de Colores**: Tonos verdes, azules y blancos
- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Animaciones Suaves**: Transiciones y efectos hover
- **Componentes Reutilizables**: Basados en shadcn/ui
- **Tipografía**: Combinación de Inter y Playfair Display

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **Vite** - Build tool y desarrollo rápido
- **React Router** - Navegación client-side
- **TailwindCSS** - Estilos utility-first
- **Lucide React** - Iconografía moderna

### Componentes UI
- **shadcn/ui** - Sistema de componentes
- **class-variance-authority** - Manejo de variantes
- **clsx & tailwind-merge** - Utilidades CSS

### Estado y Contexto
- **React Context** - Manejo de autenticación
- **Local Storage** - Persistencia de datos

## 📁 Estructura del Proyecto

```
museum/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.jsx          # Barra de navegación principal
│   │   └── ui/                     # Componentes base de UI
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       └── Badge.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx         # Contexto de autenticación
│   ├── data/
│   │   └── mockData.js             # Datos de ejemplo
│   ├── lib/
│   │   └── utils.js                # Utilidades y configuración
│   ├── pages/
│   │   ├── Home.jsx                # Página principal
│   │   ├── Catalog.jsx             # Catálogo con filtros
│   │   ├── ArtworkDetail.jsx       # Detalle de obra
│   │   ├── Profile.jsx             # Perfil de usuario
│   │   ├── Auth.jsx                # Login/Registro
│   │   └── Upload.jsx              # Subir contenido
│   ├── App.jsx                     # Componente principal
│   ├── index.css                   # Estilos globales
│   └── main.jsx                    # Punto de entrada
├── tailwind.config.js              # Configuración Tailwind
├── postcss.config.js               # Configuración PostCSS
└── package.json                    # Dependencias
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Ejecutar en modo desarrollo**:
```bash
npm run dev
```

3. **Construir para producción**:
```bash
npm run build
```

4. **Previsualizar build de producción**:
```bash
npm run preview
```

## 📚 Uso del Sistema

### Para Visitantes
1. **Explorar**: Navega por el catálogo sin necesidad de registro
2. **Buscar**: Utiliza los filtros y búsqueda para encontrar obras específicas
3. **Ver Detalles**: Haz clic en cualquier obra para ver información completa

### Para Usuarios Registrados
1. **Registro**: Crea una cuenta desde la página de autenticación
2. **Subir Arte**: Accede a la sección de upload desde tu perfil
3. **Gestionar Perfil**: Edita tu información y ve tus estadísticas
4. **Interactuar**: Da likes y guarda obras en favoritos

### Tipos de Contenido Soportado

#### 📝 Poemas
- Texto completo del poema
- Estilo literario
- Información sobre la métrica

#### 🎵 Canciones
- Archivo de audio (simulado en demo)
- Letra completa
- Información sobre instrumentos y género

#### 🎬 Videos
- Archivo de video (simulado en demo)
- Miniatura personalizable
- Información técnica de producción

#### 🖼️ Arte Visual
- Imágenes en alta resolución
- Técnicas utilizadas
- Dimensiones y materiales
- Año de creación

## 🎨 Personalización de Estilos

### Paleta de Colores
```javascript
// tailwind.config.js
colors: {
  'museum': {
    50: '#f0f9ff',   // Azul muy claro
    500: '#0ea5e9',  // Azul principal
    600: '#0284c7',  // Azul oscuro
  },
  'nature': {
    50: '#f0fdf4',   // Verde muy claro
    500: '#22c55e',  // Verde principal
    600: '#16a34a',  // Verde oscuro
  }
}
```

### Clases CSS Personalizadas
```css
.gradient-museum {
  @apply bg-gradient-to-r from-nature-600 via-museum-500 to-nature-500;
}

.text-gradient {
  @apply bg-gradient-to-r from-nature-600 to-museum-600 bg-clip-text text-transparent;
}

.glass-effect {
  @apply bg-white/80 backdrop-blur-md border border-white/20;
}
```

## 🔮 Roadmap y Mejoras Futuras

### Próximas Funcionalidades
- [ ] **Integración Backend**: API REST para persistencia real
- [ ] **Base de Datos**: PostgreSQL o MongoDB
- [ ] **Autenticación Avanzada**: OAuth, verificación por email
- [ ] **Comentarios**: Sistema de comentarios en obras
- [ ] **Seguimiento**: Seguir a otros artistas
- [ ] **Notificaciones**: Sistema de notificaciones en tiempo real

### Características VR/AR
- [ ] **Modelo 3D**: Integración con Three.js
- [ ] **Realidad Virtual**: Compatible con headsets VR
- [ ] **Tours Virtuales**: Recorridos guiados en 3D
- [ ] **Galería Inmersiva**: Espacios virtuales personalizables

### Optimizaciones
- [ ] **PWA**: Aplicación web progresiva
- [ ] **Caché Inteligente**: Estrategias de caching avanzadas
- [ ] **Optimización de Imágenes**: Lazy loading, WebP
- [ ] **SEO Mejorado**: Meta tags dinámicos, sitemap

## 🤝 Contribución

### Cómo Contribuir
1. Fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de Código
- Utiliza ESLint y Prettier
- Sigue las convenciones de naming de React
- Documenta funciones complejas
- Escribe tests para nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [shadcn/ui](https://ui.shadcn.com/) - Sistema de componentes
- [Lucide](https://lucide.dev/) - Iconografía
- [Unsplash](https://unsplash.com/) - Imágenes de ejemplo
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [React](https://react.dev/) - Framework JavaScript

---

**¡Bienvenido al futuro de los museos digitales!** 🏛️✨
