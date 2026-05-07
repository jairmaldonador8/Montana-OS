'use client';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider } from '@/context/formContext';
import { FormStep1 } from '@/components/propiedades/FormStep1';
import { FormStep2 } from '@/components/propiedades/FormStep2';
import { FormStep3 } from '@/components/propiedades/FormStep3';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock GalleryUpload component for FormStep4
vi.mock('@/components/propiedades/GalleryUpload', () => ({
  GalleryUpload: ({ onComplete }: any) => (
    <div data-testid="gallery-upload">
      <button onClick={() => onComplete(['https://example.com/photo.jpg'])}>
        Upload
      </button>
    </div>
  ),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'mock.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
      })),
    },
  })),
}));

// Mock fetch for form submission
global.fetch = vi.fn();

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('Property Capture Form - Complete Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('1. Form Initialization and Rendering', () => {
    it('renders FormStep1 initially with correct fields', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Tipo de propiedad/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Precio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Moneda/i)).toBeInTheDocument();
    });

    it('renders operation radio options', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const rentaRadio = screen.getByLabelText(/Renta/);
      expect(rentaRadio).toBeInTheDocument();
    });
  });

  describe('2. Step 1 Data Capture', () => {
    it('allows filling Step 1 data fields', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
      await user.selectOptions(typeSelect, 'casa');

      const ventaRadio = screen.getByLabelText(/Venta$/);
      await user.click(ventaRadio);

      const priceInput = screen.getByLabelText(/Precio/i);
      await user.type(priceInput, '1000000');

      // Verify form fields contain the entered data
      expect((typeSelect as HTMLSelectElement).value).toBe('casa');
      expect((ventaRadio as HTMLInputElement).checked).toBe(true);
      expect((priceInput as HTMLInputElement).value).toBe('1000000');
    });
  });

  describe('3. Conditional Field Logic', () => {
    it('shows rentalPrice only for renta and venta_o_renta operations', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
      await user.selectOptions(typeSelect, 'casa');

      const ventaRadio = screen.getByLabelText(/Venta$/);
      await user.click(ventaRadio);

      // rentalPrice should not be visible for venta
      expect(screen.queryByLabelText(/Precio de renta/i)).not.toBeInTheDocument();

      const rentaRadio = screen.getByLabelText(/Renta$/);
      await user.click(rentaRadio);

      // rentalPrice should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/Precio de renta/i)).toBeInTheDocument();
      });
    });

    it('shows rentalPrice field when changing operation to renta', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
      await user.selectOptions(typeSelect, 'casa');

      const rentaRadio = screen.getByLabelText(/Renta$/);
      await user.click(rentaRadio);

      // rentalPrice field should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/Precio de renta/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Step 2 Location Capture', () => {
    it('renders Step 2 form fields', () => {
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Colonia/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Capturar ubicación/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Referencias/i)).toBeInTheDocument();
    });

    it('allows entering location data', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const neighborhoodInput = screen.getByLabelText(/Colonia/i);
      await user.type(neighborhoodInput, 'Polanco');

      const addressInput = screen.getByLabelText(/Dirección/i);
      await user.type(addressInput, 'Calle Principal 123');

      expect((neighborhoodInput as HTMLInputElement).value).toBe('Polanco');
      expect((addressInput as HTMLInputElement).value).toBe('Calle Principal 123');
    });

    it('validates neighborhood minimum length', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const neighborhoodInput = screen.getByLabelText(/Colonia/i);
      await user.type(neighborhoodInput, 'AB');

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/La colonia debe tener al menos 3 caracteres/i)
        ).toBeInTheDocument();
      });
    });

    it('validates address minimum length', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const neighborhoodInput = screen.getByLabelText(/Colonia/i);
      await user.type(neighborhoodInput, 'Polanco');

      const addressInput = screen.getByLabelText(/Dirección/i);
      await user.type(addressInput, 'St1');

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/La dirección debe tener al menos 5 caracteres/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('5. Step 3 Property Features', () => {
    it('renders Step 3 form fields', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Recámaras/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Baños/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Construcción \(m²\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Terreno \(m²\)/i)).toBeInTheDocument();
    });

    it('allows selecting amenities from all groups', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const garageCheckbox = screen.getByRole('checkbox', { name: /Garaje/i });
      const acCheckbox = screen.getByRole('checkbox', { name: /Aire Acondicionado/i });
      const vistaPanoramicaCheckbox = screen.getByRole('checkbox', { name: /Vista Panorámica/i });

      await user.click(garageCheckbox);
      await user.click(acCheckbox);
      await user.click(vistaPanoramicaCheckbox);

      expect((garageCheckbox as HTMLInputElement).checked).toBe(true);
      expect((acCheckbox as HTMLInputElement).checked).toBe(true);
      expect((vistaPanoramicaCheckbox as HTMLInputElement).checked).toBe(true);
    });

    it('allows entering numeric values for property dimensions', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const bedroomsInput = screen.getByLabelText(/Recámaras/i);
      await user.type(bedroomsInput, '3');

      const bathroomsInput = screen.getByLabelText(/Baños/i);
      await user.type(bathroomsInput, '2');

      const m2BuiltInput = screen.getByLabelText(/Construcción \(m²\)/i);
      await user.type(m2BuiltInput, '150.50');

      expect((bedroomsInput as HTMLInputElement).value).toBe('3');
      expect((bathroomsInput as HTMLInputElement).value).toBe('2');
      // HTML input type="number" normalizes to 150.5
      expect((m2BuiltInput as HTMLInputElement).value).toBe('150.5');
    });
  });

  describe('6. Data Persistence', () => {
    it('loads previously saved form data from localStorage', () => {
      const initialData = {
        formState: {
          step1: { type: 'casa', operation: 'venta', price: 1000000, currency: 'MXN' },
          step2: {},
          step3: {},
          step4: {},
        },
        currentStep: 1,
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      // Form Provider hydrates from localStorage
      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i) as HTMLSelectElement;
      expect(typeSelect.value).toBe('casa');
    });
  });

  describe('7. Navigation Between Steps', () => {
    it('navigates back with Anterior button', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const anteriorBtn = screen.getByRole('button', { name: /Anterior/i });
      await user.click(anteriorBtn);

      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(savedData.currentStep).toBe(1);
      });
    });
  });

  describe('8. Form Structure and Navigation', () => {
    it('renders Step 1 with proper structure', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      // Verify main form elements
      expect(screen.getByLabelText(/Tipo de propiedad/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument();
    });

    it('renders Step 2 with proper structure', () => {
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      // Verify main form elements
      expect(screen.getByLabelText(/Colonia/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Anterior/i })).toBeInTheDocument();
    });

    it('renders Step 3 with proper structure', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      // Verify main form elements
      expect(screen.getByLabelText(/Recámaras/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Anterior/i })).toBeInTheDocument();
    });
  });

  describe('9. Mobile Viewport Compatibility', () => {
    it('renders form at mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
      expect(typeSelect).toBeInTheDocument();
      expect(typeSelect).toBeVisible();
    });
  });

  describe('10. Complex Interactions', () => {
    it('allows filling Step 1 completely with all fields', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
      await user.selectOptions(typeSelect, 'casa');

      const ventaRadio = screen.getByLabelText(/Venta$/);
      await user.click(ventaRadio);

      const priceInput = screen.getByLabelText(/Precio/i);
      await user.type(priceInput, '1500000');

      const currencySelect = screen.getByLabelText(/Moneda/i);
      await user.selectOptions(currencySelect, 'USD');

      // Verify all fields are filled correctly
      expect((typeSelect as HTMLSelectElement).value).toBe('casa');
      expect((ventaRadio as HTMLInputElement).checked).toBe(true);
      expect((priceInput as HTMLInputElement).value).toBe('1500000');
      expect((currencySelect as HTMLSelectElement).value).toBe('USD');
    });

    it('allows filling Step 2 with all fields', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const neighborhoodInput = screen.getByLabelText(/Colonia/i);
      await user.type(neighborhoodInput, 'Condesa');

      const addressInput = screen.getByLabelText(/Dirección/i);
      await user.type(addressInput, 'Avenida Reforma 505');

      const referencesInput = screen.getByLabelText(/Referencias/i);
      await user.type(referencesInput, 'Cerca del parque central');

      // Verify all fields are filled correctly
      expect((neighborhoodInput as HTMLInputElement).value).toBe('Condesa');
      expect((addressInput as HTMLInputElement).value).toBe('Avenida Reforma 505');
      expect((referencesInput as HTMLTextAreaElement).value).toBe('Cerca del parque central');
    });

    it('allows filling Step 3 with numeric values and amenities', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const bedroomsInput = screen.getByLabelText(/Recámaras/i);
      await user.type(bedroomsInput, '4');

      const bathroomsInput = screen.getByLabelText(/Baños/i);
      await user.type(bathroomsInput, '3');

      const m2BuiltInput = screen.getByLabelText(/Construcción \(m²\)/i);
      await user.type(m2BuiltInput, '200');

      const garageCheckbox = screen.getByRole('checkbox', { name: /Garaje/i });
      const jardinCheckbox = screen.getByRole('checkbox', { name: /Jardín/i });

      await user.click(garageCheckbox);
      await user.click(jardinCheckbox);

      // Verify all fields are filled correctly
      expect((bedroomsInput as HTMLInputElement).value).toBe('4');
      expect((bathroomsInput as HTMLInputElement).value).toBe('3');
      expect((m2BuiltInput as HTMLInputElement).value).toBe('200');
      expect((garageCheckbox as HTMLInputElement).checked).toBe(true);
      expect((jardinCheckbox as HTMLInputElement).checked).toBe(true);
    });
  });

  describe('11. GPS Functionality', () => {
    it('handles GPS button click', async () => {
      const user = userEvent.setup();
      const mockGeolocation = {
        getCurrentPosition: vi.fn(),
      };

      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
      });

      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const gpsButton = screen.getByRole('button', { name: /Capturar ubicación/i });
      await user.click(gpsButton);

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });
});
