# Montana OS

> Sistema operativo de Montana Realty Co. — CRM inmobiliario premium para San Pedro Garza García.

**Stack:** Next.js 14 · Supabase · Tailwind · TypeScript · Anthropic Claude API
**Diseño:** Oscuro elegante · Cormorant Garamond + Inter · estética luxury editorial

---

## ⚡ Setup en 30 minutos

### 1. Instalar dependencias
```bash
cd montana-os
npm install
```

### 2. Crear proyecto en Supabase
1. Ir a https://supabase.com → New project
2. Nombre: `montana-os` · Región: `us-east-1`
3. Guardar el password del DB en password manager
4. Ir a Settings → API y copiar:
   - `Project URL`
   - `anon public key`
   - `service_role key` (¡secreto!)

### 3. Ejecutar el schema
1. En Supabase, ir a SQL Editor
2. Copiar todo el contenido de `supabase/schema.sql`
3. Click Run
4. Verificar en Table Editor que se crearon 11 tablas y 5 presets de publicación

### 4. Configurar variables de entorno
```bash
cp .env.local.example .env.local
```
Editar `.env.local` con tus credenciales reales de Supabase y Anthropic.

### 5. Crear primer usuario admin (tú)
En Supabase:
1. Authentication → Users → Add user → invitar tu email con magic link
2. Una vez recibido y aceptado el magic link, copia tu user UUID
3. En SQL Editor ejecutar:
```sql
insert into public.users (id, email, name, role)
values ('TU_USER_UUID_AQUI', 'tu@email.com', 'Tu Nombre', 'admin');
```

### 6. Generar tipos de TypeScript
```bash
npx supabase login
export SUPABASE_PROJECT_ID=xxxxx  # tu project ID
npm run db:types
```

### 7. Levantar el dev server
```bash
npm run dev
```
Abrir http://localhost:3000

### 8. Deploy a Vercel
1. Push el repo a GitHub
2. En Vercel → Import Project → seleccionar el repo
3. Agregar las variables de entorno (las mismas de `.env.local`)
4. Deploy

---

## 📦 Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          ← magic link login
│   │   └── callback/route.ts       ← oauth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← layout con sidebar + topbar
│   │   ├── propiedades/
│   │   │   ├── page.tsx            ← lista de propiedades
│   │   │   ├── nueva/page.tsx      ← formulario de captura (CONSTRUIR)
│   │   │   └── [id]/page.tsx       ← detalle (CONSTRUIR)
│   │   ├── revision/               ← panel asistente (CONSTRUIR)
│   │   ├── leads/                  ← bandeja unificada (CONSTRUIR)
│   │   ├── pipeline/               ← deal flow (CONSTRUIR)
│   │   └── comisiones/             ← reportes (CONSTRUIR)
│   ├── api/
│   │   ├── ai/descripcion/         ← endpoint Claude para descripciones
│   │   └── webhooks/whatsapp/      ← entrada de leads de WhatsApp
│   ├── layout.tsx
│   ├── page.tsx                    ← landing
│   └── globals.css
├── components/
│   ├── ui/                         ← shadcn (instalar)
│   ├── shared/
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   └── propiedades/
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← cliente browser
│   │   └── server.ts               ← cliente server
│   ├── anthropic/
│   │   └── client.ts
│   ├── utils.ts                    ← cn(), formatPrice(), etc.
│   └── constants.ts                ← CHANNELS, AMENITIES, etc.
├── types/
│   └── database.ts                 ← tipos generados de Supabase
└── middleware.ts                   ← protege rutas del dashboard

supabase/
└── schema.sql                      ← schema completo
```

---

## 🛠 Cómo usar Claude Code para construir los módulos

Una vez que tengas el setup arriba funcionando, abre Claude Code en la carpeta del proyecto y dale instrucciones específicas. Aquí van prompts probados para cada módulo:

### Sprint 1 · Formulario de captura (Módulo 1)
```
Construye el formulario en src/app/(dashboard)/propiedades/nueva/page.tsx.
Es multi-step (4 pasos): datos básicos, ubicación, características, fotos+descripción.
- Usa react-hook-form + zod para validación
- Las constantes (PROPERTY_TYPES, OPERATIONS, AMENITIES) están en src/lib/constants.ts
- Las fotos suben a Supabase Storage en bucket "properties", carpeta {property_id}
- Al guardar, status = 'pending_review' y se crea registro en la tabla properties
- Después llamar a /api/ai/descripcion con los bullets para generar descripción inicial
- Diseño minimalista, oscuro, espaciado generoso · estética Montana
- Mobile-first: que funcione perfectamente desde celular en la calle
```

### Sprint 3 · Panel de revisión (Módulo 2)
```
Construye dos páginas:
1. src/app/(dashboard)/revision/page.tsx — cola de propiedades pending_review
2. src/app/(dashboard)/revision/[id]/page.tsx — pantalla de revisión individual

En la pantalla individual:
- Editar descripción (con botón "regenerar con IA")
- Reordenar fotos por drag & drop
- Selector de canales con presets (de tabla publication_presets)
- Botón "aprobar y publicar" → status='approved', crea registros en property_publications
- Botón "rechazar y devolver" → status='rejected', guarda rejection_notes, dispara notificación

Solo accesible para roles publisher/admin/broker (validar en server side).
```

### Sprint 4-5 · Publicador técnico (Módulo 3)
```
Construye el sistema de publicación a portales.
Por ahora solo el primer canal: web_montana (es nuestro propio "portal").
Crea endpoint POST /api/publishing/[channel] que reciba property_id y publique.
Para web_montana solo es marcar el registro como published; cuando tengamos el sitio nuevo, conectaremos.
También un job que reintente publicaciones en error cada 10 min.
```

### Sprint 6-7 · Bandeja unificada (Módulo 4)
```
Construye /leads con inbox tipo Linear/Front:
- Lista lateral de leads con preview
- Vista detalle a la derecha con conversación completa
- Tabs por canal (WhatsApp, web, portales)
- Filtros: hot/warm/cold, asignado a mí, sin asignar
- Badge de contador no leídos
```

---

## 🎨 Sistema de diseño Montana

**Colores principales** (en `tailwind.config.ts`):
- `montana-black` · #0A0A0A · fondo principal
- `montana-cream` · #F5F1E8 · texto principal
- `montana-gold` · #C9A961 · acentos · CTAs · brand
- `montana-stone` · #1C1C1A · cards
- `montana-slate` · #2A2A28 · inputs · borders

**Tipografía:**
- `font-editorial` (Cormorant Garamond) · headings · números grandes · italics decorativos
- `font-sans` (Inter) · body · UI · tablas

**Tono UX:**
- Espaciado generoso (`p-6` o más)
- Transiciones suaves pero rápidas (200ms)
- Micro-interacciones en botones (border → fill)
- Casi cero emojis · cero saturación visual
- Texto en mayúsculas con tracking amplio para labels secundarios
- Italic en cursivas tipo "presented by"

---

## 📚 Documentación de referencia

- **Especificación completa del MVP:** `Montana_CRM_MVP_Especificacion.md`
- **Investigación del mercado:** `CRM_Inmobiliario_Investigacion_y_Brainstorming.md`
- **Schema SQL:** `supabase/schema.sql`

---

## ⚠️ Reglas de oro mientras construyes

1. **No construyas el módulo 4 (IA + WhatsApp) hasta que módulos 1, 2 y 3 estén productivos.** La tentación va a estar fuerte. Resiste.

2. **Cada feature, dogfooding inmediato.** Cuando termines algo, úsalo tú primero. Vas a encontrar 20 cosas a mejorar.

3. **Commits pequeños y frecuentes.** Cada feature = 1 commit. Cada commit = 1 push. Vercel deploya automático.

4. **No te clavés en el diseño los primeros 3 sprints.** Estética Montana sí, pero funcional primero. Pulir en sprint 4-5.

5. **Migra las 157 propiedades de Houzez en sprint 2.** Mientras más rápido los datos estén dentro, más rápido encuentras fricciones reales.

6. **Si tienes duda, regresa al documento del MVP.** Está todo definido. Cualquier feature que no esté ahí, va al backlog para después.

---

90 días. 5 módulos. 1 caso de éxito. Vamos. 🏔
