import { z } from 'zod';

// ============ STEP 1: DATOS BÁSICOS ============
const step1BaseSchema = z.object({
  type: z.enum([
    'casa',
    'departamento',
    'terreno',
    'penthouse',
    'residencia',
    'oficina',
    'local',
    'bodega',
    'edificio',
  ]),
  operation: z.enum(['venta', 'renta', 'venta_o_renta']),
  price: z.number().positive('El precio debe ser un número positivo'),
  rentalPrice: z
    .number()
    .positive('El precio de renta debe ser un número positivo')
    .optional(),
  currency: z.enum(['MXN', 'USD']).default('MXN'),
});

// Add cross-field validation for rentalPrice requirement
export const step1Schema = step1BaseSchema.superRefine(({ operation, rentalPrice }, ctx) => {
  if ((operation === 'renta' || operation === 'venta_o_renta') && !rentalPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['rentalPrice'],
      message: 'Precio de renta es requerido para esta operación',
    });
  }
});

export type Step1Input = z.infer<typeof step1Schema>;

// ============ STEP 2: UBICACIÓN ============
export const step2Schema = z.object({
  neighborhood: z
    .string()
    .min(3, 'La colonia debe tener al menos 3 caracteres'),
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres'),
  gps: z
    .object({
      lat: z.number().min(-90, 'La latitud debe estar entre -90 y 90').max(90, 'La latitud debe estar entre -90 y 90'),
      lng: z.number().min(-180, 'La longitud debe estar entre -180 y 180').max(180, 'La longitud debe estar entre -180 y 180'),
    })
    .optional(),
  references: z.string().optional(),
});

export type Step2Input = z.infer<typeof step2Schema>;

// ============ STEP 3: CARACTERÍSTICAS ============
const step3BaseSchema = z.object({
  bedrooms: z
    .number()
    .nonnegative(
      'El número de recámaras no puede ser negativo'
    ),
  bathrooms: z
    .number()
    .nonnegative(
      'El número de baños no puede ser negativo'
    ),
  m2Built: z.number().positive('El m² construido debe ser un número positivo'),
  m2Land: z
    .number()
    .positive('El m² de terreno debe ser un número positivo')
    .optional(),
  floorLevel: z.number().optional(),
  amenities: z.array(z.string()).default([]),
});

// Add cross-field validation for m2Land >= m2Built
export const step3Schema = step3BaseSchema.superRefine(({ m2Land, m2Built }, ctx) => {
  if (m2Land !== undefined && m2Land < m2Built) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['m2Land'],
      message: 'El m² de terreno no puede ser menor que el m² construido',
    });
  }
});

export type Step3Input = z.infer<typeof step3Schema>;

// ============ STEP 4: FOTOS + DESCRIPCIÓN ============
export const step4Schema = z.object({
  photos: z.array(z.string()).default([]),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
});

export type Step4Input = z.infer<typeof step4Schema>;

// Combined schema for the entire form
export const completeFormSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
});

export type CompleteFormInput = z.infer<typeof completeFormSchema>;
