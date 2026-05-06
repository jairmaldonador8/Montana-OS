import { describe, it, expect } from 'vitest';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  type Step1Input,
  type Step2Input,
  type Step3Input,
  type Step4Input,
} from '../formValidation';

describe('Form Validation Schemas', () => {
  // ============ STEP 1: DATOS BÁSICOS ============
  describe('Step 1 - Datos Básicos', () => {
    describe('type field', () => {
      it('should accept valid property types', () => {
        const validTypes = [
          'casa',
          'departamento',
          'terreno',
          'penthouse',
          'residencia',
          'oficina',
          'local',
          'bodega',
          'edificio',
        ];

        validTypes.forEach((type) => {
          const result = step1Schema.safeParse({
            type,
            operation: 'venta',
            price: 1000000,
          });
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid property types', () => {
        const result = step1Schema.safeParse({
          type: 'invalid_type',
          operation: 'venta',
          price: 1000000,
        });
        expect(result.success).toBe(false);
      });

      it('should require type field', () => {
        const result = step1Schema.safeParse({
          operation: 'venta',
          price: 1000000,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('operation field', () => {
      it('should accept valid operations', () => {
        const validOps = ['venta', 'renta', 'venta_o_renta'];

        validOps.forEach((op) => {
          const result = step1Schema.safeParse({
            type: 'casa',
            operation: op,
            price: 1000000,
          });
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid operations', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'invalid_op',
          price: 1000000,
        });
        expect(result.success).toBe(false);
      });

      it('should require operation field', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          price: 1000000,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('price field', () => {
      it('should accept positive numbers', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: 1000000,
        });
        expect(result.success).toBe(true);
      });

      it('should accept decimal prices', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: 1500000.99,
        });
        expect(result.success).toBe(true);
      });

      it('should reject zero', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: 0,
        });
        expect(result.success).toBe(false);
      });

      it('should reject negative numbers', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: -1000000,
        });
        expect(result.success).toBe(false);
      });

      it('should require price field', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('rentalPrice field', () => {
      it('should accept positive numbers when provided', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'renta',
          price: 1000000,
          rentalPrice: 5000,
        });
        expect(result.success).toBe(true);
      });

      it('should accept decimal rental prices', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'renta',
          price: 1000000,
          rentalPrice: 5000.50,
        });
        expect(result.success).toBe(true);
      });

      it('should be optional', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: 1000000,
        });
        expect(result.success).toBe(true);
      });

      it('should reject negative rental prices', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'renta',
          price: 1000000,
          rentalPrice: -5000,
        });
        expect(result.success).toBe(false);
      });

      it('should reject zero rental price', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'renta',
          price: 1000000,
          rentalPrice: 0,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('currency field', () => {
      it('should accept MXN', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: 1000000,
          currency: 'MXN',
        });
        expect(result.success).toBe(true);
      });

      it('should accept USD', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: 1000000,
          currency: 'USD',
        });
        expect(result.success).toBe(true);
      });

      it('should default to MXN when not provided', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: 1000000,
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.currency).toBe('MXN');
        }
      });

      it('should reject invalid currencies', () => {
        const result = step1Schema.safeParse({
          type: 'casa',
          operation: 'venta',
          price: 1000000,
          currency: 'EUR',
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate complete Step 1 data', () => {
      const validData = {
        type: 'departamento',
        operation: 'venta',
        price: 2500000,
        rentalPrice: 8000,
        currency: 'MXN',
      };
      const result = step1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============ STEP 2: UBICACIÓN ============
  describe('Step 2 - Ubicación', () => {
    describe('neighborhood field', () => {
      it('should accept neighborhood with 3+ characters', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
        });
        expect(result.success).toBe(true);
      });

      it('should accept longer neighborhood names', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Santa Fe Cuajimalpa',
          address: 'Calle Principal 123',
        });
        expect(result.success).toBe(true);
      });

      it('should reject neighborhood with less than 3 characters', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'ab',
          address: 'Calle Principal 123',
        });
        expect(result.success).toBe(false);
      });

      it('should require neighborhood field', () => {
        const result = step2Schema.safeParse({
          address: 'Calle Principal 123',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('address field', () => {
      it('should accept address with 5+ characters', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Avenida Paseo de la Reforma 505',
        });
        expect(result.success).toBe(true);
      });

      it('should accept exact 5 character address', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Ave12',
        });
        expect(result.success).toBe(true);
      });

      it('should reject address with less than 5 characters', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Ave1',
        });
        expect(result.success).toBe(false);
      });

      it('should require address field', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('gps field', () => {
      it('should accept valid GPS coordinates', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
          gps: {
            lat: 19.4326,
            lng: -99.1332,
          },
        });
        expect(result.success).toBe(true);
      });

      it('should accept negative GPS coordinates', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
          gps: {
            lat: -23.5505,
            lng: -46.6333,
          },
        });
        expect(result.success).toBe(true);
      });

      it('should be optional', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
        });
        expect(result.success).toBe(true);
      });

      it('should require both lat and lng if gps is provided', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
          gps: {
            lat: 19.4326,
          },
        });
        expect(result.success).toBe(false);
      });

      it('should accept decimal GPS values', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
          gps: {
            lat: 19.432655789,
            lng: -99.133287654,
          },
        });
        expect(result.success).toBe(true);
      });
    });

    describe('references field', () => {
      it('should accept reference string when provided', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
          references: 'Cerca del Parque España',
        });
        expect(result.success).toBe(true);
      });

      it('should be optional', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
        });
        expect(result.success).toBe(true);
      });

      it('should accept empty string', () => {
        const result = step2Schema.safeParse({
          neighborhood: 'Roma',
          address: 'Calle Principal 123',
          references: '',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate complete Step 2 data', () => {
      const validData = {
        neighborhood: 'Condesa',
        address: 'Avenida Michoacán 150',
        gps: {
          lat: 19.4009,
          lng: -99.1635,
        },
        references: 'Frente a la Galería Condesa',
      };
      const result = step2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============ STEP 3: CARACTERÍSTICAS ============
  describe('Step 3 - Características', () => {
    describe('bedrooms field', () => {
      it('should accept positive integers', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
        });
        expect(result.success).toBe(true);
      });

      it('should accept zero bedrooms', () => {
        const result = step3Schema.safeParse({
          bedrooms: 0,
          bathrooms: 1,
          m2Built: 50,
        });
        expect(result.success).toBe(true);
      });

      it('should reject negative bedrooms', () => {
        const result = step3Schema.safeParse({
          bedrooms: -1,
          bathrooms: 2,
          m2Built: 150,
        });
        expect(result.success).toBe(false);
      });

      it('should require bedrooms field', () => {
        const result = step3Schema.safeParse({
          bathrooms: 2,
          m2Built: 150,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('bathrooms field', () => {
      it('should accept positive integers', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
        });
        expect(result.success).toBe(true);
      });

      it('should accept zero bathrooms', () => {
        const result = step3Schema.safeParse({
          bedrooms: 2,
          bathrooms: 0,
          m2Built: 80,
        });
        expect(result.success).toBe(true);
      });

      it('should reject negative bathrooms', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: -1,
          m2Built: 150,
        });
        expect(result.success).toBe(false);
      });

      it('should require bathrooms field', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          m2Built: 150,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('m2Built field', () => {
      it('should accept positive numbers', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150.5,
        });
        expect(result.success).toBe(true);
      });

      it('should accept decimal m2Built', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150.75,
        });
        expect(result.success).toBe(true);
      });

      it('should reject zero m2Built', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 0,
        });
        expect(result.success).toBe(false);
      });

      it('should reject negative m2Built', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: -100,
        });
        expect(result.success).toBe(false);
      });

      it('should require m2Built field', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('m2Land field', () => {
      it('should accept positive numbers', () => {
        const result = step3Schema.safeParse({
          bedrooms: 2,
          bathrooms: 1,
          m2Built: 120,
          m2Land: 300,
        });
        expect(result.success).toBe(true);
      });

      it('should accept decimal m2Land', () => {
        const result = step3Schema.safeParse({
          bedrooms: 2,
          bathrooms: 1,
          m2Built: 120,
          m2Land: 300.5,
        });
        expect(result.success).toBe(true);
      });

      it('should be optional', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
        });
        expect(result.success).toBe(true);
      });

      it('should reject zero m2Land when provided', () => {
        const result = step3Schema.safeParse({
          bedrooms: 2,
          bathrooms: 1,
          m2Built: 120,
          m2Land: 0,
        });
        expect(result.success).toBe(false);
      });

      it('should reject negative m2Land', () => {
        const result = step3Schema.safeParse({
          bedrooms: 2,
          bathrooms: 1,
          m2Built: 120,
          m2Land: -100,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('floorLevel field', () => {
      it('should accept positive floor levels', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
          floorLevel: 5,
        });
        expect(result.success).toBe(true);
      });

      it('should accept ground floor (0)', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
          floorLevel: 0,
        });
        expect(result.success).toBe(true);
      });

      it('should accept negative floor levels (basements)', () => {
        const result = step3Schema.safeParse({
          bedrooms: 2,
          bathrooms: 1,
          m2Built: 100,
          floorLevel: -1,
        });
        expect(result.success).toBe(true);
      });

      it('should be optional', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
        });
        expect(result.success).toBe(true);
      });
    });

    describe('amenities field', () => {
      it('should accept array of amenity strings', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
          amenities: ['piscina', 'gimnasio', 'seguridad 24h'],
        });
        expect(result.success).toBe(true);
      });

      it('should have empty array as default', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.amenities).toEqual([]);
        }
      });

      it('should accept empty amenities array', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
          amenities: [],
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.amenities).toEqual([]);
        }
      });

      it('should accept single amenity', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
          amenities: ['piscina'],
        });
        expect(result.success).toBe(true);
      });

      it('should reject non-string items in amenities', () => {
        const result = step3Schema.safeParse({
          bedrooms: 3,
          bathrooms: 2,
          m2Built: 150,
          amenities: ['piscina', 123, 'gimnasio'],
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate complete Step 3 data', () => {
      const validData = {
        bedrooms: 3,
        bathrooms: 2,
        m2Built: 180.5,
        m2Land: 400,
        floorLevel: 3,
        amenities: ['piscina', 'gimnasio', 'seguridad'],
      };
      const result = step3Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate Step 3 data with minimal fields', () => {
      const validData = {
        bedrooms: 0,
        bathrooms: 0,
        m2Built: 50,
      };
      const result = step3Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============ STEP 4: FOTOS + DESCRIPCIÓN ============
  describe('Step 4 - Fotos + Descripción', () => {
    describe('photos field', () => {
      it('should accept array of photo URLs', () => {
        const result = step4Schema.safeParse({
          photos: [
            'https://example.com/photo1.jpg',
            'https://example.com/photo2.jpg',
          ],
        });
        expect(result.success).toBe(true);
      });

      it('should have empty array as default', () => {
        const result = step4Schema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.photos).toEqual([]);
        }
      });

      it('should accept empty photos array', () => {
        const result = step4Schema.safeParse({
          photos: [],
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.photos).toEqual([]);
        }
      });

      it('should accept single photo', () => {
        const result = step4Schema.safeParse({
          photos: ['https://example.com/photo.jpg'],
        });
        expect(result.success).toBe(true);
      });

      it('should accept relative URLs', () => {
        const result = step4Schema.safeParse({
          photos: ['/uploads/photo1.jpg', '/uploads/photo2.jpg'],
        });
        expect(result.success).toBe(true);
      });

      it('should reject non-string items in photos', () => {
        const result = step4Schema.safeParse({
          photos: ['https://example.com/photo1.jpg', 123],
        });
        expect(result.success).toBe(false);
      });
    });

    describe('description field', () => {
      it('should accept description up to 500 characters', () => {
        const description = 'A'.repeat(500);
        const result = step4Schema.safeParse({
          description,
        });
        expect(result.success).toBe(true);
      });

      it('should accept shorter descriptions', () => {
        const result = step4Schema.safeParse({
          description: 'Hermosa casa con vista al mar.',
        });
        expect(result.success).toBe(true);
      });

      it('should be optional', () => {
        const result = step4Schema.safeParse({
          photos: ['https://example.com/photo.jpg'],
        });
        expect(result.success).toBe(true);
      });

      it('should accept empty description string', () => {
        const result = step4Schema.safeParse({
          description: '',
        });
        expect(result.success).toBe(true);
      });

      it('should reject description exceeding 500 characters', () => {
        const description = 'A'.repeat(501);
        const result = step4Schema.safeParse({
          description,
        });
        expect(result.success).toBe(false);
      });

      it('should reject description with more than 500 chars', () => {
        const description =
          'Esta es una descripción muy larga que excede los 500 caracteres límite permitidos para las descripciones de propiedades en Montana OS.'.repeat(
            6
          );
        const result = step4Schema.safeParse({
          description,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate empty Step 4 data (all optional)', () => {
      const result = step4Schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate complete Step 4 data', () => {
      const validData = {
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
          'https://example.com/photo3.jpg',
        ],
        description:
          'Hermosa propiedad con acabados de lujo, ubicada en zona residencial segura. Cuenta con todos los servicios y amenidades de la zona.',
      };
      const result = step4Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============ TYPE INFERENCE TESTS ============
  describe('Type Inference', () => {
    it('should properly infer Step1Input type', () => {
      const validData: Step1Input = {
        type: 'casa',
        operation: 'venta',
        price: 1000000,
      };
      const result = step1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should properly infer Step2Input type', () => {
      const validData: Step2Input = {
        neighborhood: 'Roma',
        address: 'Calle Principal 123',
        gps: {
          lat: 19.4326,
          lng: -99.1332,
        },
        references: 'Near park',
      };
      const result = step2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should properly infer Step3Input type', () => {
      const validData: Step3Input = {
        bedrooms: 3,
        bathrooms: 2,
        m2Built: 150,
        amenities: ['piscina'],
      };
      const result = step3Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should properly infer Step4Input type', () => {
      const validData: Step4Input = {
        photos: ['https://example.com/photo.jpg'],
        description: 'Nice property',
      };
      const result = step4Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============ ERROR MESSAGES TEST ============
  describe('Error Messages', () => {
    it('should provide error message for invalid Step 1 type', () => {
      const result = step1Schema.safeParse({
        type: 'invalid',
        operation: 'venta',
        price: 1000,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('should provide error message for negative price', () => {
      const result = step1Schema.safeParse({
        type: 'casa',
        operation: 'venta',
        price: -1000,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('should provide error message for short neighborhood', () => {
      const result = step2Schema.safeParse({
        neighborhood: 'ab',
        address: 'Valid address here',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('should provide error messages for multiple field violations', () => {
      const result = step3Schema.safeParse({
        bedrooms: -1,
        bathrooms: -2,
        m2Built: -100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
