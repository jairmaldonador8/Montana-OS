# Design: Formulario Multi-Step de Captura de Propiedades (Sprint 1)

**Fecha:** 2026-05-05  
**Proyecto:** Montana OS — CRM Inmobiliario  
**Alcance:** Formulario de captura de propiedades (4 pasos) con guardado progresivo y autosave  
**Status:** Aprobado para implementación

---

## 1. Visión

Formulario intuitivo y mobile-first que permite a los asesores capturar propiedades en 4 pasos mientras están en el campo. Soporta guardado progresivo (draft) y autosave automático para que nunca se pierdan datos.

**Objetivo:** Validar modelo de negocio con captura manual (sin IA). Posteriormente se agregará generación automática de descripciones cuando sea rentable.

---

## 2. Estructura General

### Navegación
- **Indicador de progreso:** "Paso 1 de 4" (visual + numérico)
- **Botones:**
  - "Guardar" — guardado manual inmediato
  - "Anterior" / "Siguiente" — navegar entre pasos
  - "Cancelar" — abandona sin guardar (con confirmación)

### Validación
- **On-blur:** Validación silenciosa en campos críticos (email, precio)
- **On-submit (Siguiente):** Valida paso completo, bloquea avance si hay errores
- **Mensajes de error:** Específicos y accionables, en rojo debajo del campo

### Almacenamiento
- **Autosave:** Cada campo completado (on-blur + 500ms delay) → DB
- **Manual:** Botón "Guardar" fuerza save inmediato
- **Indicador:** "Guardando..." (gris) → "Guardado" (verde, 2s)

### Diseño
- **Mobile-first:** Una columna, scroll vertical, tap targets 44px+
- **Estética:** Diseño Montana (colores, tipografía, espaciado generoso)
- **Responsivo:** Funciona en celular (asesor en calle) y desktop

---

## 3. Paso 1: Datos Básicos

### Campos

| Campo | Tipo | Requerido | Validación | Nota |
|-------|------|-----------|-----------|------|
| Tipo de propiedad | Select | Sí | Enum (casa, dpto, terreno, etc) | Catálogo cerrado |
| Operación | Radio buttons | Sí | venta \| renta \| venta_o_renta | Muestra campo renta si aplica |
| Precio | Number | Sí | > 0, formato MXN/USD | Con separadores (1,000,000) |
| Precio de renta | Number | Condicional | > 0 si operación = renta/ambas | Visible solo si aplica |
| Moneda | Select | Sí | MXN \| USD | Default MXN |

### Validación en frontend
- Tipo: obligatorio, no puede estar vacío
- Operación: obligatoria
- Precio: obligatorio, número > 0
- Moneda: default MXN

### Status al guardar
- Status = 'draft' (primer guardado)
- Tabla: `properties`
- Campos: `type`, `operation`, `price`, `rental_price`, `currency`, `captured_by`, `status`

---

## 4. Paso 2: Ubicación

### Campos

| Campo | Tipo | Requerido | Validación | Nota |
|-------|------|-----------|-----------|------|
| Colonia | Text | Sí | Texto libre, min 3 chars | Ej: "Barrio Antiguo" |
| Dirección | Text | Sí | Texto libre, min 5 chars | Ej: "Calle Principal 123" |
| Coordenadas GPS | Geo | No | Lat/Long válidas | Auto-captura si permite browser |
| Referencias | Textarea | No | Texto libre | Ej: "Cerca de XYZ" |

### Validación en frontend
- Colonia: obligatoria, min 3 caracteres
- Dirección: obligatoria, min 5 caracteres
- GPS: opcional pero recomendado
- Referencias: opcional

### Status al guardar
- Actualiza fila en `properties`
- Campos: `neighborhood`, `address`, `coordinates`, `references`

---

## 5. Paso 3: Características

### Campos

| Campo | Tipo | Requerido | Validación | Nota |
|-------|------|-----------|-----------|------|
| Recámaras | Number | Sí | >= 0 | Integer |
| Baños | Number | Sí | >= 0 | Integer |
| Construcción (m²) | Number | Sí | > 0 | Decimal, 2 decimales |
| Terreno (m²) | Number | No | > 0 si aplica | Decimal, 2 decimales |
| Piso/Nivel | Number | No | >= 0 | Solo si es departamento |
| Amenidades | Checkboxes | No | Multi-select | Catálogo cerrado (ver Apéndice A) |

### Validación en frontend
- Recámaras: obligatorio, >= 0
- Baños: obligatorio, >= 0
- Construcción: obligatorio, > 0
- Terreno: opcional
- Piso/Nivel: visible solo si tipo = departamento/penthouse
- Amenidades: opcional, pero recomendado

### Catálogo de Amenidades (Apéndice A)

**EXTERIOR:**
- Acceso a la playa
- Frente a la playa
- Frente al agua
- Garaje
- Estacionamiento techado
- Facilidad para estacionarse
- Jardín
- Patio
- Riego por aspersión
- Parrilla
- Roof garden
- Andén
- Muelle de carga
- Cisterna

**INTERIOR:**
- Estudio
- Vestidor / Walk-in closet
- Cocina integral
- Cuarto de servicio
- Cuarto de lavado
- Bodega
- Pozo
- Paneles solares
- Smart home
- Aire acondicionado
- Calefacción
- Chimenea
- Cava
- Biblioteca
- Sala TV
- Sala de juegos
- Cuarto de visitas
- Oficina en casa
- Elevador

**SEGURIDAD/SERVICIOS:**
- Caseta de vigilancia
- Seguridad 24h
- Circuito cerrado
- Acceso controlado
- Área de juegos infantil
- Cancha de tenis
- Cancha de pádel
- Salón de eventos
- Business center
- Pet friendly

**VISTAS:**
- Vista panorámica
- Vista montaña
- Vista ciudad

### Status al guardar
- Actualiza fila en `properties`
- Campos: `bedrooms`, `bathrooms`, `m2_built`, `m2_land`, `floor_level`, `amenities` (JSON array)

---

## 6. Paso 4: Fotos + Descripción

### Campos

| Campo | Tipo | Requerido | Validación | Nota |
|-------|------|-----------|-----------|------|
| Galería de fotos | File upload | Recomendado | JPG/PNG, max 10MB, max 10 fotos | Drag-drop para reordenar |
| Descripción | Textarea | Opcional | 0-500 caracteres | Manual (sin IA por ahora) |

### Funcionalidad de fotos
- **Upload:** Supabase Storage bucket `properties/{property_id}/`
- **Reordenar:** Drag-drop, persistencia en tabla `property_media`
- **Eliminar:** Click en "X", confirma borrado
- **Validación:** JPG/PNG, 10MB max, 10 fotos max

### Descripción
- Manual (textarea libre)
- **Posterior:** Botón "Generar con IA" (cuando se active Anthropic)
- Min: 0 chars (opcional)
- Max: 500 chars (recomendado 150-300)

### Status al guardar
- Si paso 4 completado + "Siguiente": **status = 'pending_review'**
- Si solo "Guardar" en paso 4: **status = 'draft'** (continúa en draft)
- Campos: `description`, `media` (relación con `property_media`)

---

## 7. Flujo de Guardado y Autosave

### Autosave
```
1. User completa un campo (on-blur)
2. Cliente valida on-blur (silent, sin error visible)
3. Si valida: 500ms delay → POST /api/properties/{id}/autosave
4. DB actualiza campo individual
5. UI muestra: "Guardando..." → "Guardado" (verde, 2s)
6. Indicador desaparece automáticamente
```

### Guardado Manual (Botón "Guardar")
```
1. User clickea "Guardar"
2. Valida paso actual (on-submit)
3. Si hay errores: muestra en rojo, bloquea
4. Si ok: POST /api/properties/{id} → status = 'draft'
5. Toast: "Guardado correctamente"
```

### Siguiente paso (Botón "Siguiente")
```
1. User clickea "Siguiente"
2. Valida paso actual (completo)
3. Si errores: muestra bloqueador, lista errores
4. Si ok: Transición a siguiente paso
5. Si paso 4 + "Siguiente": status = 'pending_review'
```

### Retroceder (Botón "Anterior")
```
1. Navega al paso anterior
2. Carga datos guardados (autosave)
3. User puede editar
4. Cambios se guardan en autosave nuevamente
```

---

## 8. Manejo de Errores y Edge Cases

| Caso | Comportamiento |
|------|----------------|
| User actualiza página en paso 2 | Carga paso 2 con datos guardados (autosave) |
| User cierra navegador en paso 3 | Próxima sesión: entra a paso 3 con datos |
| Falla upload de foto | Reintentar, mostrar error específico |
| Foto > 10MB | Rechazar, sugerir comprimir |
| > 10 fotos | Bloquear, mostrar límite |
| Conflicto de datos (multi-sesión) | Last-write-wins (documento no especifica locking) |

---

## 9. Endpoints requeridos (API)

| Endpoint | Método | Función |
|----------|--------|---------|
| `/api/properties` | POST | Crear propiedad nueva (draft) |
| `/api/properties/{id}` | PATCH | Actualizar propiedad (cualquier paso) |
| `/api/properties/{id}/autosave` | POST | Guardar individual field |
| `/api/properties/{id}/media/upload` | POST | Upload foto a Storage |
| `/api/properties/{id}/media/{mediaId}` | DELETE | Eliminar foto |
| `/api/properties/{id}` | GET | Obtener propiedad (para edición) |

---

## 10. Componentes React

```
src/app/(dashboard)/propiedades/nueva/page.tsx
├── <FormContainer>
│   ├── <ProgressBar /> (1/4, 2/4, etc)
│   ├── <FormStep1 /> (Datos básicos)
│   ├── <FormStep2 /> (Ubicación)
│   ├── <FormStep3 /> (Características)
│   ├── <FormStep4 /> (Fotos + Descripción)
│   ├── <AutosaveIndicator /> (Guardando/Guardado)
│   └── <FormButtons /> (Anterior/Guardar/Siguiente)

src/components/propiedades/
├── FormStep1.tsx
├── FormStep2.tsx
├── FormStep3.tsx
├── FormStep4.tsx
├── GalleryUpload.tsx (drag-drop fotos)
└── AmenitiesCheckboxes.tsx

src/lib/
├── formValidation.ts (zod schemas para 4 pasos)
└── utils.ts (formatPrice, etc)
```

---

## 11. Tecnologías

- **Form:** react-hook-form + zod (validación)
- **Autosave:** useCallback + debounce (500ms)
- **Upload:** Supabase Storage
- **UI:** Radix + Tailwind
- **Icons:** Lucide-react

---

## 12. Criterios de Aceptación

- [ ] Formulario renderiza en 4 pasos (1/4, 2/4, 3/4, 4/4)
- [ ] Validación on-blur en campos críticos (precio, email)
- [ ] Validación on-submit al clickear "Siguiente"
- [ ] Autosave cada campo completado (on-blur + 500ms)
- [ ] Indicador "Guardando..."/"Guardado" visible
- [ ] Pueden guardar como draft en cualquier paso
- [ ] Pueden retroceder y editar pasos previos
- [ ] Al completar paso 4 + "Siguiente": status = 'pending_review'
- [ ] Upload de fotos funciona (max 10MB, max 10 fotos)
- [ ] Drag-drop para reordenar fotos
- [ ] Descripción es textarea libre (sin IA)
- [ ] Mobile-first: funciona perfectamente en celular

---

## Apéndice: Cambios vs. Planificación Original

- **Autosave agregado:** No estaba especificado, user solicitó
- **Amenidades expandidas:** Incluye referencia de inmobiliaria (playa, agua, etc)
- **Sin IA en paso 4:** Descripción manual (validar modelo primero)
- **Guardado progresivo:** Cada paso es guardable como draft (opción B)

---

**Próximos pasos:** Spec review → Deep-research → Skills audit → Writing-plans → Implementation
