# Montana OS CRM Premium — Especificación de Diseño

> **Para agentic workers:** REQUIRED SUB-SKILL: Use ultrapowers:deep-research (recomendado) o ultrapowers:subagent-driven-development para implementar este plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un CRM inmobiliario profesional y vendible que permita a asesores cerrar clientes, gestionar leads, y dar seguimiento automatizado. Sistema basado en GoHighLevel con dashboards role-based para Admin, Asesor y Coordinador.

**Architecture:** Sistema de 3 dashboards especializados según rol (Admin/Manager, Asesor, Coordinador). Pipeline de 7 etapas con automatizaciones inteligentes en cada punto. Leads llegan de múltiples fuentes (manual, web, importación) y se trabajan hasta cierre con recordatorios y escalamientos automáticos.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase (PostgreSQL), Motion para animaciones.

---

## PARTE 1: ARQUITECTURA DE ROLES & DASHBOARDS

### Dashboard 1: ADMIN/MANAGER
**Propósito:** Visión completa de la operación y gestión del equipo.

**Features principales:**
- Vista centralizada de TODOS los leads (filtrable por asesor, etapa, propiedad, fecha, presupuesto)
- Pipeline global: ver dónde están todos los leads en tiempo real
- Desempeño del equipo: 
  - Conversión rate por asesor
  - Leads cerrados por asesor
  - Tiempo promedio en cada etapa
  - Ingresos generados
- Alertas inteligentes:
  - Leads atrasados (> 7 días sin mover)
  - Asesores underperforming
  - Oportunidades grandes sin movimiento
- Configuración:
  - Gestionar asesores y permisos
  - Definir automaciones
  - Personalizar pipelines (si aplica)
- Reportes avanzados:
  - Ingresos por mes/trimestre/año
  - Leads por fuente (manual, web, importación)
  - Tasa de conversión por etapa
  - Análisis de tendencias

**Acceso:** Solo administrador/gerente de la inmobiliaria.

---

### Dashboard 2: ASESOR
**Propósito:** Herramienta de cierre 100% enfocada. Simple, clara, sin ruido.

**Features principales:**
- **Mi trabajo HOY:** 
  - Tareas prioritarias (calls, follow-ups, visitas programadas)
  - Recordatorios automáticos
- **Mi Pipeline (Kanban visual):**
  - Columnas por etapa: Nuevo | Primer Contacto | Calificado | Presentación Programada | Viendo Propiedad | Negociación | Cierre
  - Arrastra leads entre etapas
- **Perfil detallado del lead:**
  - Click en un lead → todo su historial
  - Datos personales, búsqueda, interacciones, notas
  - Propiedades mostradas y feedback
  - Documentos compartidos
- **Acciones rápidas:**
  - Registrar llamada/email/mensaje
  - Agendar seguimiento
  - Compartir propiedad
  - Mover a siguiente etapa
- **Mi performance:**
  - Conversión rate personal
  - Leads totales / cerrados
  - Ingresos generados
  - Tiempo promedio por etapa

**Acceso:** Solo sus propios leads asignados.

---

### Dashboard 3: COORDINADOR ADMINISTRATIVO (Opcional)
**Propósito:** Soporte operativo y gestión administrativa.

**Features principales:**
- Leads nuevos: revisar y asignar a asesores
- Coordinación: ver agenda de visitas, evitar conflictos
- Documentación: gestionar papelería, contratos, firmas
- Seguimiento: alertar sobre leads sin follow-up
- Reportes simples: leads procesados, asignaciones

**Acceso:** Todos los leads, pero sin editar data crítica de asesores.

---

## PARTE 2: PIPELINE & AUTOMATIZACIONES

### Pipeline de 7 Etapas

```
Nuevo 
  ↓
Primer Contacto 
  ↓
Calificado 
  ↓
Presentación Programada 
  ↓
Viendo Propiedad 
  ↓
Negociación 
  ↓
Cierre ✓
```

---

### AUTOMATIZACIONES POR ETAPA

#### **ETAPA 1: NUEVO**
Lead entra al sistema (cualquier fuente).

**Sistema automáticamente:**
- ✅ Asigna a asesor (round-robin balanceado u opción manual)
- ✅ Crea tarea: "Contactar [Nombre] hoy"
- ✅ Envía notificación al asesor:
  - WhatsApp: "Nuevo lead: Juan García, $300K-$500K, busca casa en Garza García"
- ✅ Registra timestamp de entrada

**Asesor ve:**
- Lead en su vista "Mi trabajo HOY"
- Botón "Contactar ahora" prominente

---

#### **ETAPA 2: PRIMER CONTACTO**
Asesor hace contacto (call, email, mensaje).

**Asesor registra:**
- Tipo: Llamada / Email / WhatsApp / Reunión
- Resultado: Contacto realizado / No responde / Rechaza / Programar callback
- Notas: Lo que el cliente dijo

**Sistema automáticamente:**
- ✅ Registra timestamp, duración (si call)
- ✅ Crea próxima tarea según resultado:
  - Si "Contacto realizado" → tarea "Cualificar a Juan"
  - Si "No responde" → recordatorio 24h después
  - Si "Rechaza" → archiva pero sin borrar
- ✅ Si > 3 días sin respuesta → recordatorio al asesor
- ✅ Si > 5 días sin movimiento → ESCALA a manager

---

#### **ETAPA 3: CALIFICADO**
Asesor confirma que es un lead viable.

**Asesor completa:**
- Presupuesto real: Confirmado vs estimado
- Timeline: Cuándo necesita comprar
- Tipo propiedad: Casa / Depto / Terreno / etc (confirmado)
- Financiamiento: Contado / Crédito / Por definir
- Notas: Preferencias específicas, restricciones

**Sistema automáticamente:**
- ✅ Si presupuesto > $1M → notifica a manager ("Oportunidad grande")
- ✅ Sugiere propiedades que matchean criterios
- ✅ Tarea: "Presentar propiedades a Juan"

---

#### **ETAPA 4: PRESENTACIÓN PROGRAMADA**
Cita programada para ver propiedad.

**Asesor registra:**
- Propiedad a mostrar
- Fecha y hora de la cita
- Ubicación de encuentro

**Sistema automáticamente:**
- ✅ Agrega a calendario del asesor (Google Calendar sync)
- ✅ Envía confirmación al cliente 24h antes
- ✅ Recordatorio al asesor 1h antes
- ✅ Si cliente cancela → registra automáticamente
- ✅ Tarea: "Prepara presentación de la propiedad"

---

#### **ETAPA 5: VIENDO PROPIEDAD**
Visita realizada.

**Asesor registra:**
- Propiedad visitada
- Reacción del cliente: 🔥 Muy interesado / 😐 Neutral / ❌ No le gustó
- Feedback rápido: Qué comentó, objeciones, siguientes pasos

**Sistema automáticamente:**
- ✅ Si "Muy interesado" → tarea urgente "Hacer oferta"
- ✅ Si "Neutral" → recordatorio 24h después
- ✅ Si "No gustó" → sugiere otras propiedades similares
- ✅ Crea historial completo (cliente vio X propiedad, reacción, fecha)
- ✅ Si > 7 días sin movimiento → ESCALA a manager

---

#### **ETAPA 6: NEGOCIACIÓN**
Oferta hecha, esperando respuesta.

**Asesor registra:**
- Monto ofertado
- Condiciones (plazo, financiamiento, etc)
- Fecha esperada de respuesta

**Sistema automáticamente:**
- ✅ Tracking automático: cuánto tiempo lleva la negociación
- ✅ Recordatorio: "Respuesta del vendedor vence mañana"
- ✅ Si > 7 días sin respuesta → ESCALA a manager
- ✅ Tarea: "Dar seguimiento a oferta"

---

#### **ETAPA 7: CIERRE ✓**
Lead cerrado exitosamente.

**Asesor registra:**
- Monto final
- Comisión
- Notas de cierre

**Sistema automáticamente:**
- ✅ Genera reporte de cierre (tiempo total, comisión, historial)
- ✅ Registra en analytics para reportes
- ✅ Archiva lead (sigue visible pero como "Cerrado")
- ✅ Notifica a manager y coordinador
- ✅ Actualiza números del asesor

---

### ESCALAMIENTOS AUTOMÁTICOS AL MANAGER

Sistema alerta al manager cuando:
- ❌ Lead lleva > 7 días sin mover de etapa
- ❌ Asesor tiene > 10 leads abandonados (sin interacción > 14 días)
- ❌ Oportunidad grande (presupuesto > $1M) sin movimiento > 3 días
- ❌ Tasa de conversión del asesor cae < threshold histórico
- ❌ Múltiples clientes reportan que no pueden contactar al asesor

**Manager puede:**
- Ver detalle del lead
- Reasignar a otro asesor
- Enviar mensaje al asesor
- Tomar acción directa si es crítico

---

## PARTE 3: ESTRUCTURA DE DATOS (CAMPOS DE LEAD)

### DATOS PERSONALES (Contacto)
- `nombre_completo` (string, requerido)
- `telefono_principal` (string, requerido, validado)
- `email` (string, requerido, validado)
- `whatsapp` (string, opcional)
- `ubicacion_actual` (string, opcional)

### DATOS INMOBILIARIOS (Lo que busca)
- `tipo_propiedad` (enum: Casa, Departamento, Terreno, Comercial, Otro)
- `presupuesto_min` (number)
- `presupuesto_max` (number)
- `zona_preferida` (string, selectable de mapa)
- `recamaras` (number, opcional)
- `banos` (number, opcional)
- `timeline` (enum: Hoy, Este mes, Este año, Sin prisa)
- `financiamiento` (enum: Contado, Crédito, Por definir)

### DATOS DE SEGUIMIENTO (Pipeline)
- `etapa_actual` (enum: Nuevo, Primer Contacto, Calificado, etc)
- `asesor_asignado` (foreign key a Asesor)
- `proxima_accion` (string)
- `fecha_proxima_accion` (datetime)
- `ultima_interaccion` (datetime)
- `tipo_ultima_interaccion` (enum: Llamada, Email, WhatsApp, Visita, Reunión)
- `temperatura` (enum: 🔥 Hot, 🟡 Warm, 🧊 Cold)
- `fuente_lead` (enum: Manual, Web Form, Importación, Referencia)

### DATOS DE HISTORIAL (Automático)
- `historial_interacciones` (array)
  - Cada interacción: { tipo, fecha, duración, notas, resultado }
- `notas_privadas` (texto largo, solo asesor + manager)
- `propiedades_mostradas` (array con feedback de cada una)
- `documentos_compartidos` (archivos con timestamp)

### DATOS DE NEGOCIACIÓN (Cuando llega a oferta)
- `oferta_monto` (number)
- `oferta_fecha_respuesta` (datetime)
- `oferta_status` (enum: En espera, Aceptada, Rechazada, Contraoferta)
- `oferta_condiciones` (texto)

### METADATA
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `closed_at` (timestamp, cuando se cierra)
- `dias_en_pipeline` (calculado automáticamente)
- `comision_estimada` (calculado automáticamente)

---

## PARTE 4: INTEGRACIONES & FUENTES DE LEADS

### FUENTE 1: Leads Manuales
- Dashboard: Botón "Nuevo Lead"
- Formulario simple con campos básicos
- Asignación inmediata

### FUENTE 2: Leads desde Web
- Formulario en landing page (Montana OS)
- Lead entra automáticamente al CRM
- Asignación automática a asesor disponible
- Notificación instantánea

### FUENTE 3: Importación en Lote
- Opción "Importar leads" (CSV)
- Validación automática
- Asignación por round-robin
- Historial importado si existe

### INTEGRACIONES EXTERNAS RECOMENDADAS
- **WhatsApp API:** Enviar mensajes desde CRM, historial en lead
- **Google Calendar:** Sincronización bidireccional de citas
- **Gmail/Outlook:** Sincronización de emails con lead (si aplica)
- **Zapier:** Integración con Facebook Ads, Google Forms, etc

---

## PARTE 5: REPORTES & ANALYTICS

### REPORTES PARA MANAGER
- Dashboard de KPIs (real-time):
  - Leads totales en sistema
  - Leads cerrados este mes / trimestre / año
  - Conversion rate general
  - Ingresos totales generados
  
- Desempeño por asesor:
  - Leads asignados
  - Leads cerrados
  - Conversion rate individual
  - Tiempo promedio en cada etapa
  - Ingresos generados
  
- Análisis de leads:
  - Leads por fuente (% que cierran por fuente)
  - Leads por etapa (cuántos en cada etapa)
  - Edad promedio de leads por etapa
  
- Análisis de tendencias:
  - Ingresos por mes (gráfico)
  - Leads procesados por mes
  - Forecast de ingresos (proyección)

### REPORTES PARA ASESOR
- Mi performance:
  - Leads totales / cerrados
  - Conversion rate
  - Ingresos generados
  - Tiempo promedio por etapa
  
- Mi pipeline:
  - Cuántos leads en cada etapa
  - Cuáles son los más viejos (necesitan acción)

---

## PARTE 6: UX/UI PRINCIPLES

**Para Admin:**
- Máxima información, máxima claridad
- Colores para urgencia (rojo: atrasado, amarillo: a vencer)
- Tablas y gráficos potentes
- Filtros avanzados

**Para Asesor:**
- Mínimo de clicks para actuar
- Tareas prominentes en el home
- Kanban visual para pipeline
- Botones de acción grandes y obvios
- Notificaciones inteligentes (no abrumar)

**Sistema general:**
- Diseño Montana OS (blanco, amarillo #FBBF24, Poppins)
- Animaciones suaves (Motion)
- Dark mode disponible
- Responsive mobile-first
- Accesibilidad WCAG 2.1 AA

---

## PARTE 7: DATOS TÉCNICOS

### Base de datos (Supabase/PostgreSQL)
Tablas principales:
- `users` (admin, asesor, coordinador)
- `leads` (con todos los campos descritos)
- `interacciones` (historial de calls, emails, etc)
- `propiedades` (listado de propiedades inmobiliarias)
- `ofertas` (historial de ofertas)
- `tareas` (task tracking automático)

### APIs necesarias
- CRUD de leads
- Automatizaciones (ejecutar según trigger)
- Reportes (queries analíticas)
- Webhooks (WhatsApp, Google Calendar)

### Stack confirmado
- Frontend: Next.js 15, React 19, TypeScript
- UI: Tailwind CSS v4, shadcn/ui, Motion
- Backend: Next.js API Routes o Node.js
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (con roles)

---

## SIGUIENTE PASO

Este spec será validado por un revisor, y luego procederemos a:
1. **Deep Research** - Verificar best practices actuales de CRMs
2. **Skills Audit** - Auditar si tenemos las habilidades necesarias
3. **Implementation Plan** - Plan detallado task-by-task
4. **Execution** - Implementación con subagent-driven-development
