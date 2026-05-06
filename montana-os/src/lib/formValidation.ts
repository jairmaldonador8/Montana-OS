import { z } from 'zod';

// ============ STEP 1: DATOS BÁSICOS ============
export const step1Schema = z.object({
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
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  references: z.string().optional(),
});

export type Step2Input = z.infer<typeof step2Schema>;

// ============ STEP 3: CARACTERÍSTICAS ============
export const step3Schema = z.object({
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
