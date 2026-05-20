# Montana OS - Design System Spec
**Dinámico y Energético - Sistema de Diseño Completo**

**Fecha:** 2026-05-20  
**Proyecto:** Montana OS CRM Inmobiliario  
**Objetivo:** Rediseño visual completo para convertir Montana OS en un producto premium vendible  
**Status:** Aprobado

---

## 1. Visión y Propósito

Montana OS es un CRM inmobiliario de próxima generación. El nuevo sistema de diseño debe:
- Transmitir **modernidad, energía y confianza**
- Ser **accesible y amigable** (no corporativo ni frío)
- Facilitar **ventas del producto** como solución premium
- Mantener **coherencia visual** en landing page + dashboard + componentes

**Enfoque:** Dinámico y Energético
- Blanco limpio como fondo principal
- Amarillo vibrante como acento energético
- Tipografía Poppins (moderna, amigable, sin serif)
- Bordes redondeados y micro-interacciones
- Emojis y elementos visuales que generan conexión emocional

---

## 2. Sistema de Colores

### Paleta Primaria

| Color | Hex | Uso |
|-------|-----|-----|
| Blanco Puro | `#FFFFFF` | Fondos principales, cards, espacios en blanco |
| Amarillo Vibrante | `#FBBF24` | Botones primarios, hover, CTAs, acentos principales |
| Amarillo Claro | `#FCD34D` | Backgrounds suaves, highlights, gradientes |
| Gris Texto | `#1F2937` | Texto principal, máxima legibilidad |
| Gris Claro | `#F3F4F6` | Backgrounds de cards alternos, sections |
| Gris Border | `#E5E7EB` | Separadores, borders, líneas divisorias |

### Paleta Secundaria (Estados)

| Estado | Hex | Uso |
|--------|-----|-----|
| Éxito Verde | `#10B981` | Estados positivos, confirmaciones, checkmarks |
| Error Rojo | `#EF4444` | Alertas, validaciones fallidas, destructivas |
| Info Azul | `#3B82F6` | Información, notificaciones, links |
| Advertencia Naranja | `#F97316` | Warnings, cambios importantes |

### Gradientes

```css
/* Navbar gradient */
background: linear-gradient(90deg, #FFFBF5 0%, #FFFEF0 100%);

/* Hover cards gradient */
background: linear-gradient(135deg, rgba(252, 211, 77, 0.06) 0%, rgba(251, 191, 36, 0.06) 100%);

/* CTA gradient */
background: linear-gradient(135deg, #FBBF24 0%, #FCD34D 100%);

/* Dark gradient (para modales/overlays) */
background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(55, 65, 81, 0.95) 100%);
```

---

## 3. Tipografía

### Font Family
**Poppins** (Google Fonts)
- Todas las categorías usan Poppins
- No hay serif (se usa únicamente sans-serif)
- Pesos disponibles: 400, 500, 600, 700

### Escala Tipográfica

| Nivel | Font | Peso | Tamaño | Line Height | Caso de uso |
|-------|------|------|--------|-------------|------------|
| H1 | Poppins | 700 | 48px / 32px mob | 1.2 | Títulos hero, secciones principales |
| H2 | Poppins | 600 | 32px / 24px mob | 1.3 | Subtítulos, secciones |
| H3 | Poppins | 600 | 20px / 18px mob | 1.4 | Títulos de cards, componentes |
| H4 | Poppins | 600 | 18px | 1.4 | Subtítulos internos |
| Body | Poppins | 400 | 16px | 1.6 | Texto principal de párrafos |
| Body Small | Poppins | 400 | 14px | 1.6 | Descripciones, subtexto |
| Label | Poppins | 500 | 14px | 1.4 | Labels de inputs, tags |
| Caption | Poppins | 400 | 12px | 1.5 | Pequeño texto, timestamps |
| Button | Poppins | 600 | 14px-16px | 1.4 | Texto en botones |

### Letter Spacing
```css
/* Labels y texto pequeño */
letter-spacing: +0.5px;

/* Headings */
letter-spacing: -0.5px;

/* Body normal */
letter-spacing: 0px;
```

---

## 4. Componentes Principales

### 4.1 Botones

#### Botón Primario
```
Estado normal:
  - Background: #FBBF24 (Amarillo Vibrante)
  - Text: #1F2937 (Gris Texto)
  - Padding: 10px 24px
  - Border radius: 24px (píldora)
  - Font: Poppins 600
  - Box shadow: 0 4px 6px rgba(251, 191, 36, 0.15)

Estado hover:
  - Background: #F59E0B (Amarillo más oscuro)
  - Box shadow: 0 6px 12px rgba(251, 191, 36, 0.25)
  - Transform: translateY(-2px)
  
Estado active/press:
  - Background: #D97706
  - Transform: translateY(0px)
  - Box shadow: 0 2px 4px rgba(251, 191, 36, 0.15)

Estado disabled:
  - Background: #E5E7EB
  - Text: #9CA3AF
  - Cursor: not-allowed
```

#### Botón Secundario
```
Estado normal:
  - Background: transparent
  - Border: 2px solid #FBBF24
  - Text: #FBBF24
  - Padding: 10px 24px
  - Border radius: 24px

Estado hover:
  - Background: rgba(251, 191, 36, 0.1)
  - Border color: #F59E0B
```

#### Botón Iconográfico (round)
```
  - Tamaño: 48px (h) × 48px (w)
  - Background: #FBBF24
  - Border radius: 50%
  - Icon size: 24px
  - Hover: mismo efecto que primary button
```

### 4.2 Cards de Propiedades

```
Layout:
  - Border radius: 16px
  - Background: #FFFFFF
  - Border: 1px solid #E5E7EB
  - Box shadow: 0 1px 3px rgba(0, 0, 0, 0.05)
  - Padding: 0 (card completo)
  - Overflow: hidden

Componentes internos:
  
  [Imagen] (height: 200px)
    - Background: linear-gradient(135deg, #FCD34D 0%, #FCD34D 100%)
    - Icono centrado: Home icon
    
  [Contenido] (padding: 24px)
    - Header con título + heart button (flex space-between)
    - Stars rating (⭐⭐⭐⭐⭐)
    - Precio grande y negrilla
    - Ubicación con icono MapPin
    - Botones: [Ver más] [Contactar]
    
Estado hover:
  - Box shadow: 0 10px 25px rgba(0, 0, 0, 0.1)
  - Transform: translateY(-4px)
  - Transition: 300ms ease-out
```

### 4.3 Inputs y Formularios

```
Texto Input:
  - Height: 44px
  - Padding: 12px 16px
  - Border: 1px solid #E5E7EB
  - Border radius: 8px
  - Font: Poppins 400, 16px
  - Background: #FFFFFF
  
Estado focus:
  - Border: 2px solid #FBBF24
  - Box shadow: 0 0 0 3px rgba(251, 191, 36, 0.1)
  - Outline: none
  
Estado error:
  - Border: 2px solid #EF4444
  - Box shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)

Label:
  - Font: Poppins 500, 14px
  - Color: #1F2937
  - Margin bottom: 8px
  - Display: block

Placeholder:
  - Color: #9CA3AF
  - Font: Poppins 400
```

### 4.4 Tarjetas de Estadísticas

```
Layout:
  - Border radius: 12px
  - Padding: 20px
  - Background: #FFFFFF
  - Border: 1px solid #E5E7EB
  - Min-height: auto
  
Contenido:
  - Icon (32px) en background color suave
  - Label (Poppins 400, 14px, #6B7280)
  - Valor (Poppins 700, 28px, #1F2937)
  - Optional: delta/cambio (Poppins 500, 12px, verde/rojo)

Colores de icons (background):
  - Amarillo: bg-amber-100 text-amber-600
  - Azul: bg-blue-100 text-blue-600
  - Verde: bg-emerald-100 text-emerald-600
  - Púrpura: bg-purple-100 text-purple-600
```

### 4.5 Navbar/Header

```
Background: linear-gradient(90deg, #FFFBF5 0%, #FFFEF0 100%)
Height: 64px
Border-bottom: 1px solid #E5E7EB
Padding: 16px 24px (horizontal) × 12px (vertical)
Sticky: true (z-index: 40)

Logo:
  - Font: Poppins 700, 24px
  - Color: #1F2937
  
Nav Items:
  - Font: Poppins 500, 14px
  - Color: #6B7280
  - Hover: color #FBBF24, background transparent
  - Active: color #FBBF24, bottom border 2px #FBBF24

CTA Button:
  - Estilo: Primary button (Poppins 600, amarillo)
```

### 4.6 Sidebar (Dashboard)

```
NO sidebar visible en mobile (max-width: 768px)
Desktop:
  - Width: 256px
  - Background: #FFFFFF
  - Border-right: 1px solid #E5E7EB
  - Sticky/Fixed
  
Logo section:
  - Padding: 24px
  - Border-bottom: 1px solid #E5E7EB
  - Font: Poppins 700, 24px
  
Nav items:
  - Padding: 8px 16px (horizontal) × 10px (vertical)
  - Margin: 4px 0
  - Border-radius: 8px
  - Font: Poppins 500, 14px
  
Item estados:
  - Default: color #6B7280, hover bg #F3F4F6
  - Active: bg #FCD34D, text #1F2937
  - Transition: 200ms ease
```

---

## 5. Layouts

### 5.1 Landing Page

```
Estructura:
1. Navbar (sticky)
2. Hero section (h-screen, centered content)
3. Features/Benefits (grid, cards)
4. Propiedades destacadas (carousel)
5. CTA section (grande, amarillo)
6. FAQ (accordion)
7. Footer (dark)

Colores:
  - Fondo: #FFFFFF
  - Acentos: #FBBF24
  - Texto: #1F2937
  
Spacing:
  - Vertical sections: padding-y 80px-120px
  - Max width: 1280px
  - Horizontal padding: 24px-48px
```

### 5.2 Dashboard Layout

```
Structure:
  <Navbar sticky top-0 />
  <div flex min-h-screen>
    <Sidebar hidden lg:flex />
    <main flex-1>
      <TopBar />
      <MainContent padding-6 lg:padding-10 />
    </main>
  </div>

Colores:
  - Background: #FFFFFF
  - Card backgrounds: #F3F4F6 o #FFFFFF
  - Acentos: #FBBF24
  
Responsive:
  - Mobile: full-width, no sidebar
  - Tablet: sidebar colapsable
  - Desktop: sidebar visible always
```

---

## 6. Micro-interacciones y Animaciones

### 6.1 Transiciones

```css
/* Estándar */
transition: all 200ms ease-out;

/* Hover más suave */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Rápidas */
transition: all 150ms ease-in-out;
```

### 6.2 Animaciones

```
Hover button:
  - translateY(-2px)
  - box-shadow increase
  - duration: 200ms

Hover card:
  - translateY(-4px)
  - box-shadow increase
  - duration: 300ms

Loading spinner:
  - Rotación 360° × 2s (infinite, linear)
  - Color: #FBBF24

Fade in:
  - opacity 0 → 1
  - duration: 300ms
  - delay: staggered por componente

Focus ring (inputs):
  - box-shadow con color amarillo
  - duration: 150ms
```

### 6.3 Elementos Dinámicos

- **Heart/Like button**: Scale 1 → 1.2 on click, color change
- **Stars rating**: Cada star tiene hover individual
- **Ripple effect**: En botones (opcional, solo primarios)
- **Toast notifications**: Slide in desde top-right, auto-dismiss 4s
- **Skeleton loaders**: Shimmer effect en amarillo claro

---

## 7. Iconografía

### Icons
- **Librería:** Lucide React
- **Tamaño:** 20px (standard), 24px (emphasis), 16px (small)
- **Color:** Heredado del texto o acento

### Emojis
- Usados estratégicamente en cards de propiedades
- 🏠 Casa, 🏡 Casa moderna, 🏢 Edificio, 🌳 Terreno
- Nunca abusar de emojis (máximo 1 por card)

---

## 8. Accesibilidad

### WCAG 2.1 AA Compliance
- Contraste mínimo 4.5:1 para texto (amarillo #FBBF24 con blanco/oscuro)
- Links con underline o cambio de color evidente
- Botones con min 44px × 44px (touch targets)
- Texto mínimo 14px
- Focus rings visibles (outline o box-shadow)

### Keyboard Navigation
- Tab order lógico (top-left → bottom-right)
- Escape cierra modales
- Enter activa botones/CTAs
- Space activa checkboxes/toggles

### Color Blind
- No usar SOLO color como indicador
- Usar iconos + color
- Text labels en botones (no solo iconos)

---

## 9. Breakpoints y Responsividad

```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px

Cambios principales:
- Navbar: hamburger menu en mobile
- Sidebar: hidden en mobile, collapsible en tablet
- Cards: 1 col mobile, 2 cols tablet, 3 cols desktop
- Fuentes: reducidas en mobile (-2px)
- Padding: reducido en mobile (16px vs 24px)
- Images: responsive, max-width 100%
```

---

## 10. Estructura de Archivos

### Tailwind Configuration
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      amber: {
        400: '#FBBF24', // Primary
        300: '#FCD34D', // Light
      },
      gray: { /* standard Tailwind */ }
    },
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
    borderRadius: {
      '2xl': '16px',
      'full': '24px', // Pills
    },
    spacing: {
      // standard
    },
  }
}
```

### Component Structure
```
src/components/
├── shared/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
├── buttons/
│   ├── Button.tsx (Primary, Secondary, Icon)
│   ├── ButtonGroup.tsx
├── cards/
│   ├── PropertyCard.tsx
│   ├── StatCard.tsx
├── inputs/
│   ├── TextInput.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   └── FormGroup.tsx
├── layouts/
│   ├── DashboardLayout.tsx
│   └── LandingLayout.tsx
└── sections/
    ├── Hero.tsx
    ├── Features.tsx
    └── CTA.tsx
```

---

## 11. Implementation Roadmap

### Phase 1: Foundation (Semana 1)
- [ ] Configurar Tailwind colors y fonts
- [ ] Crear componentes base (Button, Input, Card)
- [ ] Actualizar Navbar y Sidebar
- [ ] Crear design-preview demo

### Phase 2: Landing Page (Semana 2)
- [ ] Rediseñar homepage con nuevo sistema
- [ ] Crear hero section
- [ ] Agregar features section
- [ ] Build CTA section

### Phase 3: Dashboard (Semana 3)
- [ ] Rediseñar dashboard layout
- [ ] Actualizar property cards
- [ ] Rediseñar formularios
- [ ] Agregar stat cards

### Phase 4: Polish & Launch (Semana 4)
- [ ] Micro-interacciones y animaciones
- [ ] Testing responsivo
- [ ] Accessibility audit
- [ ] Deploy a producción

---

## 12. Notas de Diseño

- El amarillo (#FBBF24) es el color más importante - debe destacar siempre
- Mantener 60-30-10 rule: 60% blanco, 30% grises, 10% amarillo
- Usar mucho whitespace (no saturar)
- Bordes redondeados (nunca sharp/squared)
- Sombras suaves (no dramáticas)
- Emojis son permitidos pero limitados
- Poppins es la identidad tipográfica - no cambiar

---

**Especificación escrita por:** Brainstorming Skill  
**Aprobado por:** Usuario (2026-05-20)  
**Próximo paso:** Deep Research + Implementation Planning
