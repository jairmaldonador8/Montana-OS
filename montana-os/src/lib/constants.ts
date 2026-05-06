// Canales de publicación soportados
export const CHANNELS = [
  { id: 'inmuebles24', name: 'Inmuebles24', tier: 'premium' },
  { id: 'lamudi', name: 'Lamudi', tier: 'premium' },
  { id: 'easybroker', name: 'EasyBroker', tier: 'premium' },
  { id: 'vivanuncios', name: 'Vivanuncios', tier: 'standard' },
  { id: 'properati', name: 'Properati', tier: 'standard' },
  { id: 'proppit', name: 'Proppit', tier: 'standard' },
  { id: 'trovit', name: 'Trovit', tier: 'mass' },
  { id: 'mitula', name: 'Mitula', tier: 'mass' },
  { id: 'nuroa', name: 'Nuroa', tier: 'mass' },
  { id: 'nestoria', name: 'Nestoria', tier: 'mass' },
  { id: 'pincali', name: 'Pincali', tier: 'mass' },
  { id: 'icasas', name: 'iCasas', tier: 'mass' },
  { id: 'clasco', name: 'Clasco', tier: 'mass' },
  { id: 'web_montana', name: 'Web Montana', tier: 'own' },
  { id: 'instagram', name: 'Instagram', tier: 'own' },
  { id: 'facebook', name: 'Facebook', tier: 'own' },
  { id: 'whatsapp_grupos', name: 'WhatsApp grupos corredores', tier: 'own' },
  { id: 'red_corredores', name: 'Red privada de corredores', tier: 'private' },
  { id: 'web_montana_privado', name: 'Web Montana · sección privada', tier: 'private' },
] as const;

export type ChannelId = (typeof CHANNELS)[number]['id'];

// Tipos de propiedad
export const PROPERTY_TYPES = [
  { id: 'casa', label: 'Casa' },
  { id: 'departamento', label: 'Departamento' },
  { id: 'penthouse', label: 'Penthouse' },
  { id: 'residencia', label: 'Residencia' },
  { id: 'terreno', label: 'Terreno' },
  { id: 'oficina', label: 'Oficina' },
  { id: 'local', label: 'Local comercial' },
  { id: 'bodega', label: 'Bodega' },
  { id: 'edificio', label: 'Edificio' },
] as const;

// Operaciones
export const OPERATIONS = [
  { id: 'venta', label: 'Venta' },
  { id: 'renta', label: 'Renta' },
  { id: 'venta_o_renta', label: 'Venta o renta' },
] as const;

// Amenidades (catálogo cerrado para mantener consistencia)
export const AMENITIES = [
  'alberca',
  'jacuzzi',
  'gimnasio',
  'terraza',
  'roof_garden',
  'jardín',
  'asador',
  'estudio',
  'vestidor',
  'walk_in_closet',
  'cocina_integral',
  'cuarto_servicio',
  'cuarto_lavado',
  'bodega',
  'cisterna',
  'pozo',
  'paneles_solares',
  'smart_home',
  'aire_acondicionado',
  'calefacción',
  'chimenea',
  'cava',
  'biblioteca',
  'sala_tv',
  'sala_juegos',
  'cuarto_visitas',
  'oficina_en_casa',
  'elevador',
  'caseta_vigilancia',
  'seguridad_24h',
  'circuito_cerrado',
  'acceso_controlado',
  'área_juegos_infantil',
  'cancha_tenis',
  'cancha_padel',
  'salon_eventos',
  'business_center',
  'pet_friendly',
  'vista_panoramica',
  'vista_montaña',
  'vista_ciudad',
  'frente_lago',
  'frente_golf',
] as const;

// Estatus legal
export const LEGAL_STATUS = [
  { id: 'escrituras', label: 'Escrituras al corriente' },
  { id: 'predial_corriente', label: 'Predial al corriente' },
  { id: 'libre_gravamen', label: 'Libre de gravamen' },
] as const;

// Roles del sistema
export const ROLES = {
  admin: 'Administrador',
  broker: 'Broker',
  publisher: 'Asistente · Publisher',
  agent: 'Asesor',
} as const;

export type Role = keyof typeof ROLES;

// Stages del pipeline de deals
export const DEAL_STAGES = [
  { id: 'lead_qualified', label: 'Lead cualificado', color: 'bg-zinc-500' },
  { id: 'visit_scheduled', label: 'Visita programada', color: 'bg-blue-500' },
  { id: 'visit_done', label: 'Visita realizada', color: 'bg-indigo-500' },
  { id: 'offer_presented', label: 'Oferta presentada', color: 'bg-purple-500' },
  { id: 'offer_accepted', label: 'Oferta aceptada', color: 'bg-violet-500' },
  { id: 'in_escrituration', label: 'En escrituración', color: 'bg-amber-500' },
  { id: 'closed_won', label: 'Cerrado · ganado', color: 'bg-emerald-500' },
  { id: 'closed_lost', label: 'Cerrado · perdido', color: 'bg-red-500' },
] as const;

// Status de propiedad
export const PROPERTY_STATUS = {
  draft: { label: 'Borrador', color: 'bg-zinc-500' },
  pending_review: { label: 'Pendiente de revisión', color: 'bg-amber-500' },
  rejected: { label: 'Devuelta al asesor', color: 'bg-red-500' },
  approved: { label: 'Aprobada', color: 'bg-blue-500' },
  published: { label: 'Publicada', color: 'bg-emerald-500' },
  paused: { label: 'Pausada', color: 'bg-orange-500' },
  sold: { label: 'Vendida', color: 'bg-emerald-700' },
  rented: { label: 'Rentada', color: 'bg-emerald-700' },
  archived: { label: 'Archivada', color: 'bg-zinc-700' },
} as const;
