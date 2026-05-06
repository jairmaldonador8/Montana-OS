# Montana OS - Sistema de Roles, Autenticación y Autorización

**Fecha:** 2026-05-06  
**Versión:** 1.0  
**Estado:** Especificación de diseño aprobada

---

## 1. Visión General

Montana OS es un CRM inmobiliario con tres tipos de usuarios:
- **Asesores** (agents): Crean y gestionan propiedades personales
- **Administradores** (admin): Revisan, aprueban y gestionan todas las propiedades
- **Publishers**: Publican propiedades en brokers externos

El sistema requiere:
1. Autenticación basada en emails personalizados (nombre@montana.com)
2. Control de acceso granular según rol
3. Auditoría completa de cambios
4. Notificaciones en tiempo real

---

## 2. Roles y Permisos

### 2.1 Asesor (agent)
- **Email:** nombre@montana.com (ej: maria.lopez@montana.com)
- **Acceso:** Dashboard de asesor en `/propiedades/nueva`
- **Puede:**
  - Crear propiedades (estado: draft)
  - Editar sus propias propiedades
  - Enviar propiedades para revisión
  - Ver propiedades de otros asesores (published solo)
  - Solicitar bajar una propiedad
  - Ver notificaciones de aprobación/rechazo/publicación
- **No puede:**
  - Ver propiedades rechazadas de otros
  - Editar propiedades de otros asesores
  - Aprobar o rechazar propiedades
  - Ver panel administrativo

### 2.2 Administrador (admin)
- **Email:** admin@montana.com
- **Acceso:** Dashboard administrativo en `/propiedades?view=admin`
- **Puede:**
  - Ver TODAS las propiedades de todos los asesores
  - Editar propiedades de cualquier asesor
  - Aprobar propiedades (estado: approved)
  - Rechazar propiedades con motivo (estado: rejected)
  - Autorizar/rechazar solicitudes de bajar propiedades
  - Crear nuevos asesores y administradores
  - Ver historial de cambios (audit log)
  - Filtrar propiedades por asesor, estado, tipo, fecha
- **Nota:** Jefe y Secretaria comparten este rol con los mismos permisos

### 2.3 Publisher
- **Email:** publisher@montana.com
- **Acceso:** Vista de publicación en `/propiedades?view=publisher`
- **Puede:**
  - Ver propiedades aprobadas
  - Publicar en brokers (Inmuebles24, Lamudi, etc)
  - Registrar qué brokers se publicó
- **No puede:**
  - Aprobar o rechazar propiedades
  - Editar datos de propiedad
  - Crear usuarios

---

## 3. Estructura de Base de Datos

### 3.1 Tabla `usuarios`
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,  -- nombre@montana.com o admin@montana.com
  rol ENUM ('agent', 'admin', 'broker', 'publisher') NOT NULL,
  nombre TEXT NOT NULL,
  avatar_url TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT now(),
  actualizado_en TIMESTAMP DEFAULT now()
);
```

### 3.2 Tabla `permisos`
```sql
CREATE TABLE permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  puede_crear_propiedades BOOLEAN DEFAULT false,
  puede_editar_propiedades BOOLEAN DEFAULT false,
  puede_enviar_revision BOOLEAN DEFAULT false,
  puede_aprobar_propiedades BOOLEAN DEFAULT false,
  puede_rechazar_propiedades BOOLEAN DEFAULT false,
  puede_ver_todas_propiedades BOOLEAN DEFAULT false,
  puede_bajar_propiedades BOOLEAN DEFAULT false,
  puede_autorizar_bajar BOOLEAN DEFAULT false,
  puede_crear_usuarios BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT now(),
  actualizado_en TIMESTAMP DEFAULT now(),
  UNIQUE(usuario_id)
);
```

**Valores por rol:**
- **agent:** puede_crear_propiedades, puede_editar_propiedades, puede_enviar_revision, puede_bajar_propiedades
- **admin:** puede_ver_todas_propiedades, puede_editar_propiedades, puede_aprobar_propiedades, puede_rechazar_propiedades, puede_autorizar_bajar, puede_crear_usuarios
- **publisher:** (custom, solo publicar)

### 3.3 Tabla `propiedades` (expandida)
```sql
CREATE TABLE propiedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id),
  creado_por_nombre TEXT NOT NULL,  -- cache del nombre para sticker
  estado ENUM (
    'draft', 'pending_review', 'rejected', 'approved', 
    'published', 'paused', 'sold', 'rented', 'archived'
  ) DEFAULT 'draft',
  datos_propiedad JSONB,  -- { type, address, price, currency, bedrooms, ... }
  brokers_publicados JSONB DEFAULT '{}',  -- { "inmuebles24": true, "lamudi": false, ... }
  rechazada_razon TEXT,  -- feedback si fue rechazada
  aprobada_por UUID REFERENCES usuarios(id),  -- admin que aprobó
  creado_en TIMESTAMP DEFAULT now(),
  actualizado_en TIMESTAMP DEFAULT now()
);
```

### 3.4 Tabla `audit_log`
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  accion TEXT NOT NULL,  -- 'crear', 'editar', 'aprobar', 'rechazar', 'publicar', 'bajar'
  tabla_afectada TEXT NOT NULL,
  registro_id UUID NOT NULL,
  cambios JSONB,  -- { antes: {...}, despues: {...} }
  timestamp TIMESTAMP DEFAULT now()
);
```

### 3.5 Tabla `notificaciones`
```sql
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,  -- 'aprobada', 'rechazada', 'publicada_broker', 'solicitud_bajar'
  mensaje TEXT NOT NULL,
  propiedad_id UUID REFERENCES propiedades(id),
  datos JSONB,  -- brokers publicados, razon rechazo, etc
  leido BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT now()
);
```

---

## 4. Flujos de Usuario

### 4.1 Flujo: Login
```
1. Usuario ingresa: nombre@montana.com
2. Supabase Auth valida email + password
3. Sistema obtiene registro de tabla `usuarios`
4. Valida: activo = true
5. Obtiene permisos de tabla `permisos`
6. Redirige según rol:
   - agent → /propiedades/nueva
   - admin → /propiedades?view=admin
   - publisher → /propiedades?view=publisher
```

### 4.2 Flujo: Asesor crea propiedad
```
1. Asesor accede /propiedades/nueva
2. Completa FormStep1-4 (tipo, ubicación, características, fotos)
3. Al guardar: estado = draft
4. Asesor ve botón "Enviar para revisión"
5. Al hacer clic:
   - estado = pending_review
   - Se crea entrada en audit_log
   - Se notifica a admin: "Nueva propiedad pendiente"
6. Mientras está en draft, asesor puede editar libremente
```

### 4.3 Flujo: Admin revisa propiedades
```
1. Admin accede /propiedades?view=admin
2. Ve tabla con TODAS las propiedades
3. Filtros: asesor, estado, tipo, fecha, etc
4. Al hacer clic en propiedad:
   - Ve datos completos
   - Ve "Subida por: María López" (sticker)
   - Botones: Editar / Aprobar / Rechazar
5. Si Edita:
   - Puede cambiar cualquier dato
   - Se registra en audit_log quién cambió qué
6. Si Aprueba:
   - estado = approved
   - Se notifica al asesor: "Propiedad aprobada ✓"
   - Ahora lista para publicación
7. Si Rechaza:
   - Escribe motivo (ej: "Falta foto de fachada")
   - estado = rejected
   - Se notifica al asesor con motivo
   - Asesor puede editar y reenviar
```

### 4.4 Flujo: Publisher publica en brokers
```
1. Publisher accede /propiedades?view=publisher
2. Ve propiedades en estado: approved
3. Selecciona propiedad
4. Elige brokers (Inmuebles24, Lamudi, EasyBroker, etc)
5. Al publicar:
   - estado = published
   - brokers_publicados se actualiza
   - Se crea entrada en audit_log
   - Se notifica a asesor: "Publicada en Inmuebles24, Lamudi 🎉"
```

### 4.5 Flujo: Asesor solicita bajar propiedad
```
1. Asesor ve su propiedad (cualquier estado)
2. Haz clic: "Solicitar bajar propiedad"
3. Escribe motivo (opcional)
4. estado = pending_removal (nuevo estado)
5. Se notifica a admin: "Asesor X solicita bajar propiedad"
6. Admin revisa y:
   - Si Aprueba: estado = archived o paused
   - Si Rechaza: vuelve al estado anterior
```

---

## 5. Row Level Security (RLS)

### 5.1 Política para asesores
```sql
-- Asesor ve sus propias propiedades + propiedades published de otros
CREATE POLICY "agent_select_propiedades" ON propiedades
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR estado = 'published'
  );

-- Asesor edita solo sus propias propiedades en estado draft
CREATE POLICY "agent_update_propiedades" ON propiedades
  FOR UPDATE
  USING (user_id = auth.uid() AND estado = 'draft')
  WITH CHECK (user_id = auth.uid());
```

### 5.2 Política para admins
```sql
-- Admin ve todas las propiedades
CREATE POLICY "admin_select_propiedades" ON propiedades
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND u.rol = 'admin'
    )
  );

-- Admin edita cualquier propiedad
CREATE POLICY "admin_update_propiedades" ON propiedades
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND u.rol = 'admin'
    )
  );
```

---

## 6. API Endpoints

### 6.1 Autenticación
```
POST   /api/auth/register          → Crear usuario (admin solo)
GET    /api/auth/me                → Obtener usuario + permisos actuales
POST   /api/auth/logout            → Cerrar sesión
```

### 6.2 Propiedades
```
GET    /api/propiedades            → Lista (con RLS filtrado)
POST   /api/propiedades            → Crear nueva (asesor)
PUT    /api/propiedades/[id]       → Editar (asesor su propia, admin cualquiera)
GET    /api/propiedades/[id]       → Obtener detalle
DELETE /api/propiedades/[id]       → Borrar (soft delete)

POST   /api/propiedades/[id]/enviar-revision       → Enviar a review (asesor)
POST   /api/propiedades/[id]/aprobar               → Aprobar (admin)
POST   /api/propiedades/[id]/rechazar              → Rechazar con motivo (admin)
POST   /api/propiedades/[id]/publicar-broker       → Publicar en brokers (publisher)
POST   /api/propiedades/[id]/solicitar-bajar       → Solicitar bajar (asesor)
POST   /api/propiedades/[id]/autorizar-bajar       → Autorizar bajar (admin)
```

### 6.3 Notificaciones
```
GET    /api/notificaciones         → Obtener notificaciones del usuario
PUT    /api/notificaciones/[id]    → Marcar como leído
DELETE /api/notificaciones/[id]    → Eliminar
```

### 6.4 Usuarios (admin solo)
```
GET    /api/usuarios               → Lista de usuarios
POST   /api/usuarios               → Crear usuario
PUT    /api/usuarios/[id]          → Editar usuario
DELETE /api/usuarios/[id]          → Desactivar usuario (soft delete)
```

### 6.5 Audit Log
```
GET    /api/audit-log              → Ver historial de cambios (admin)
```

---

## 7. Componentes Frontend

### 7.1 Dashboard Asesor
**Ubicación:** `/propiedades/nueva`

Componentes:
- `FormContainer` - Crear/editar propiedad (4 pasos)
- `MisPropiedades` - Lista de propiedades personales con estados
- `PropiedadesPublicadas` - Propiedades de otros asesores (read-only)
- `NotificacionesBell` - Aprobaciones, rechazos, publicaciones
- `PropCard` - Tarjeta de propiedad con sticker "Subida por: [Nombre]"

### 7.2 Dashboard Admin
**Ubicación:** `/propiedades?view=admin`

Componentes:
- `ColaRevision` - Tabla con propiedades pending_review
- `FiltrosAvanzados` - Por asesor, estado, tipo, fecha
- `DetallePropiedad` - Vista expandida con opciones: editar, aprobar, rechazar
- `EstadísticasGenerales` - Propiedades por asesor, por estado
- `GestorUsuarios` - Crear asesores, admins, publishers

### 7.3 Dashboard Publisher
**Ubicación:** `/propiedades?view=publisher`

Componentes:
- `PropiedadesAprobadas` - Tabla de propiedades approved
- `PublicadorBrokers` - Selector de brokers + botón publicar
- `HistorialPublicacion` - Qué se publicó dónde y cuándo

---

## 8. Notificaciones

### 8.1 Tipos
| Evento | Receptor | Mensaje |
|--------|----------|---------|
| Propiedad aprobada | Asesor | "Tu propiedad 'Casa en Polanco' fue aprobada ✓" |
| Propiedad rechazada | Asesor | "Tu propiedad rechazada. Motivo: Falta foto de fachada" |
| Publicada en brokers | Asesor | "Publicada en Inmuebles24, Lamudi, EasyBroker 🎉" |
| Solicitud bajar aprobada | Asesor | "Tu solicitud para bajar fue aprobada" |
| Nueva propiedad para revisar | Admin | "María López envió 'Departamento en Condesa' para revisión" |
| Solicitud bajar pendiente | Admin | "Juan García solicita bajar 'Terreno en Reforma'" |

### 8.2 Implementación
- Se crean automáticamente en tabla `notificaciones` al cambiar estado
- `NotificationBell` en topbar (icono + contador)
- Centro de notificaciones (/notificaciones) con historial
- Supabase realtime (subscripción a cambios en notificaciones)

---

## 9. Seguridad

### 9.1 Autenticación
- Supabase Auth con email + password
- Tokens JWT almacenados en httpOnly cookies
- Middleware valida token en cada request

### 9.2 Autorización
- RLS en base de datos como primera línea de defensa
- Validación de permisos en API endpoints
- Middleware verifica rol y redirige según acceso

### 9.3 Auditoría
- Tabla `audit_log` registra quién, qué, cuándo
- Cambios capturan estado anterior y nuevo
- Admin puede ver historial completo

---

## 10. Casos de Uso Especiales

### 10.1 Asesor intenta editar propiedad de otro asesor
- RLS rechaza (user_id != auth.uid())
- Frontend no muestra botón editar
- API retorna 403 Forbidden

### 10.2 Admin rechaza una propiedad
- Escribe motivo (ej: "Falta foto de fachada, dirección incompleta")
- Estado vuelve a draft
- Asesor recibe notificación con motivo detallado
- Asesor puede editar y reenviar

### 10.3 Asesor solicita bajar propiedad publicada
- Admin ve solicitud en dashboard
- Puede ver por qué quiere bajarla
- Si aprueba: estado = archived (se pausa publicación)
- Se registra en audit_log quién autorizó y cuándo

### 10.4 Admin ve propiedades de un asesor específico
- Usa filtro "Por asesor"
- Ve todas sus propiedades en todos los estados
- Puede editar o cambiar estado sin permiso del asesor

---

## 11. Migración e Implementación

### Fase 1: Base de datos
- Crear tablas (usuarios, permisos, audit_log, notificaciones)
- Configurar RLS
- Migrar usuario actual como admin

### Fase 2: Autenticación
- Modificar login page para buscar usuario en tabla `usuarios`
- Obtener rol y permisos
- Redirigir según rol

### Fase 3: Dashboard Admin
- Crear vista `/propiedades?view=admin`
- Implementar cola de revisión
- Botones: aprobar, rechazar, editar

### Fase 4: Notificaciones
- Crear tabla y API endpoints
- NotificationBell en topbar
- Supabase realtime

### Fase 5: Gestión de usuarios
- Admin puede crear asesores
- Generar passwords temporales
- Enviar invitaciones por email

---

## 12. Preguntas Frecuentes

**P: ¿Qué pasa si un asesor intenta ver la propiedad de otro en la API?**  
R: RLS filtra el resultado. Si no es published, no la ve. Si es published, la ve pero read-only.

**P: ¿El admin puede cambiar el rol de un asesor a admin?**  
R: Sí. En GestorUsuarios, puede cambiar rol. Se registra en audit_log.

**P: ¿Qué sucede si un admin edita una propiedad?**  
R: Se registra en audit_log: "admin X editó propiedad Y. Cambios: antes {...}, después {...}". El asesor NO recibe notificación (pero puede verlo en historial).

**P: ¿Se pueden recuperar propiedades archived?**  
R: Sí. Admin puede cambiar estado de archived a draft/approved nuevamente.

---

## 13. Éxito y Métricas

### El sistema funciona cuando:
- ✅ Asesor puede crear propiedad y enviar para revisión
- ✅ Admin ve cola de revisión y puede aprobar/rechazar
- ✅ Asesor recibe notificación cuando es aprobada
- ✅ Publisher publica en brokers y asesor recibe notificación
- ✅ Audit log registra todos los cambios
- ✅ RLS previene que asesor vea propiedades de otros (excepto published)
- ✅ Admin puede crear nuevos asesores y admins

---

**Fin de la especificación**
