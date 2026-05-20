import { z } from 'zod';

/**
 * Lead validation schema for the lead ingestion pipeline
 * Validates lead data and enforces business rules
 */

export const LeadSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .nullable(),
  telefono: z
    .string()
    .regex(/^\d{7,}/, 'Teléfono debe tener al menos 7 dígitos')
    .optional()
    .nullable(),
  whatsapp: z.string().optional().nullable(),
  ubicacion_actual: z.string().optional().nullable(),
  tipo_propiedad: z.enum(['Casa', 'Departamento', 'Terreno', 'Comercial']),
  presupuesto_min: z
    .number()
    .positive('Presupuesto mínimo debe ser positivo')
    .optional()
    .nullable(),
  presupuesto_max: z
    .number()
    .positive('Presupuesto máximo debe ser positivo')
    .optional()
    .nullable(),
  zona: z.string().optional().nullable(),
  recamaras: z
    .number()
    .int()
    .nonnegative('Recámaras no puede ser negativo')
    .optional()
    .nullable(),
  banos: z
    .number()
    .int()
    .nonnegative('Baños no puede ser negativo')
    .optional()
    .nullable(),
  timeline: z
    .enum(['Hoy', 'Este mes', 'Este año', 'Sin prisa'])
    .optional()
    .nullable(),
  financiamiento: z
    .enum(['Contado', 'Crédito', 'Por definir'])
    .optional()
    .nullable(),
  fuente: z.enum(['manual', 'web_form', 'csv_import']),
});

export type Lead = z.infer<typeof LeadSchema>;

/**
 * Schema for validating lead creation requests
 * Ensures at least one contact method is provided (email or telefono)
 */
export const LeadCreationSchema = LeadSchema.superRefine(
  ({ email, telefono }, ctx) => {
    if (!email && !telefono) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Al menos un método de contacto es requerido (email o teléfono)',
        path: ['email'],
      });
    }
  }
);

export type LeadCreation = z.infer<typeof LeadCreationSchema>;

/**
 * Schema for budget validation
 * Ensures presupuesto_min <= presupuesto_max if both are provided
 */
export const BudgetValidationSchema = z
  .object({
    presupuesto_min: z.number().optional().nullable(),
    presupuesto_max: z.number().optional().nullable(),
  })
  .superRefine(({ presupuesto_min, presupuesto_max }, ctx) => {
    if (
      presupuesto_min &&
      presupuesto_max &&
      presupuesto_min > presupuesto_max
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'El presupuesto mínimo no puede ser mayor que el presupuesto máximo',
        path: ['presupuesto_max'],
      });
    }
  });
