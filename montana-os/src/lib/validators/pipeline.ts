import { z } from 'zod';

export const CreateLeadSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  nombre: z.string().min(2, 'Nombre required'),
  email: z.string().email('Invalid email').optional(),
  whatsapp: z.string().optional(),
  fuente: z.enum(['form', 'whatsapp_directo', 'facebook', 'landing_page']).optional(),
  notas: z.string().optional(),
});

export const UpdateLeadStatusSchema = z.object({
  status: z.enum([
    'lead_nuevo',
    'interesado',
    'pendiente_respuesta',
    'en_visita',
    'propuesta_enviada',
    'cerrado',
    'no_interesado',
  ]),
  notes: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
