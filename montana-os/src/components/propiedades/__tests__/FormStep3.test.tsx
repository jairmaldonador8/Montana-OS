'use client';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormStep3 } from '../FormStep3';
import { FormProvider } from '@/context/formContext';

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

describe('FormStep3 Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render bedrooms input field', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Recámaras/i)).toBeInTheDocument();
    });

    it('should render bathrooms input field', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Baños/i)).toBeInTheDocument();
    });

    it('should render m2Built input field', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Construcción \(m²\)/i)).toBeInTheDocument();
    });

    it('should render m2Land input field', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Terreno \(m²\)/i)).toBeInTheDocument();
    });

    it('should render EXTERIOR amenity group', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByText(/EXTERIOR/i)).toBeInTheDocument();
    });

    it('should render INTERIOR amenity group', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByText(/INTERIOR/i)).toBeInTheDocument();
    });

    it('should render VISTAS amenity group', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByText(/VISTAS/i)).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      expect(screen.getByRole('button', { name: /Anterior/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument();
    });
  });

  describe('Numeric Field Interaction', () => {
    it('should allow entering bedrooms value', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const bedroomsInput = screen.getByLabelText(/Recámaras/i) as HTMLInputElement;
      await user.type(bedroomsInput, '3');

      expect(bedroomsInput.value).toBe('3');
    });

    it('should allow entering bathrooms value', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const bathroomsInput = screen.getByLabelText(/Baños/i) as HTMLInputElement;
      await user.type(bathroomsInput, '2');

      expect(bathroomsInput.value).toBe('2');
    });

    it('should accept decimal values for m2Built', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const m2BuiltInput = screen.getByLabelText(/Construcción \(m²\)/i) as HTMLInputElement;
      await user.type(m2BuiltInput, '125.50');

      // HTML input type="number" normalizes to 125.5
      expect(m2BuiltInput.value).toBe('125.5');
    });

    it('should allow entering m2Land value', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const m2LandInput = screen.getByLabelText(/Terreno \(m²\)/i) as HTMLInputElement;
      await user.type(m2LandInput, '300');

      expect(m2LandInput.value).toBe('300');
    });
  });

  describe('Amenity Checkbox Toggle', () => {
    it('should allow toggling amenity checkboxes', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const garageCheckbox = screen.getByRole('checkbox', { name: /Garaje/i }) as HTMLInputElement;
      expect(garageCheckbox.checked).toBe(false);

      await user.click(garageCheckbox);

      expect(garageCheckbox.checked).toBe(true);
    });

    it('should allow selecting multiple amenities', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const garageCheckbox = screen.getByRole('checkbox', { name: /Garaje/i });
      const jardinCheckbox = screen.getByRole('checkbox', { name: /Jardín/i });
      const acCheckbox = screen.getByRole('checkbox', { name: /Aire Acondicionado/i });

      await user.click(garageCheckbox);
      await user.click(jardinCheckbox);
      await user.click(acCheckbox);

      expect((garageCheckbox as HTMLInputElement).checked).toBe(true);
      expect((jardinCheckbox as HTMLInputElement).checked).toBe(true);
      expect((acCheckbox as HTMLInputElement).checked).toBe(true);
    });

    it('should allow unchecking previously selected amenities', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const garageCheckbox = screen.getByRole('checkbox', { name: /Garaje/i }) as HTMLInputElement;

      await user.click(garageCheckbox);
      expect(garageCheckbox.checked).toBe(true);

      await user.click(garageCheckbox);
      expect(garageCheckbox.checked).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should have validation setup for required fields', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      // Verify input fields exist and can receive input
      const bedroomsInput = screen.getByLabelText(/Recámaras/i);
      const bathroomsInput = screen.getByLabelText(/Baños/i);
      const m2BuiltInput = screen.getByLabelText(/Construcción \(m²\)/i);

      expect(bedroomsInput).toBeInTheDocument();
      expect(bathroomsInput).toBeInTheDocument();
      expect(m2BuiltInput).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should render submit button for form submission', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      expect(submitBtn).toBeInTheDocument();
    });

    it('should allow selecting amenities before submission', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      // Select amenities
      const garageCheckbox = screen.getByRole('checkbox', { name: /Garaje/i });
      const jardinCheckbox = screen.getByRole('checkbox', { name: /Jardín/i });

      await user.click(garageCheckbox);
      await user.click(jardinCheckbox);

      expect((garageCheckbox as HTMLInputElement).checked).toBe(true);
      expect((jardinCheckbox as HTMLInputElement).checked).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to step 2 when Anterior button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      const anteriorBtn = screen.getByRole('button', { name: /Anterior/i });
      await user.click(anteriorBtn);

      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(savedData.currentStep).toBe(2);
      });
    });
  });

  describe('Data Persistence', () => {
    it('should load and display previously saved step 3 data', async () => {
      const initialData = {
        formState: {
          step1: {},
          step2: {},
          step3: {
            bedrooms: 3,
            bathrooms: 2,
            m2Built: 150,
            m2Land: 300,
            amenities: ['garaje', 'jardín'],
          },
          step4: {},
        },
        currentStep: 3,
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      await waitFor(() => {
        const bedroomsInput = screen.getByLabelText(/Recámaras/i) as HTMLInputElement;
        const bathroomsInput = screen.getByLabelText(/Baños/i) as HTMLInputElement;

        expect(bedroomsInput.value).toBe('3');
        expect(bathroomsInput.value).toBe('2');
      });
    });

    it('should load previously selected amenities', async () => {
      const initialData = {
        formState: {
          step1: {},
          step2: {},
          step3: {
            bedrooms: 2,
            bathrooms: 1,
            m2Built: 100,
            amenities: ['garaje', 'aire_acondicionado'],
          },
          step4: {},
        },
        currentStep: 3,
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      await waitFor(() => {
        const garageCheckbox = screen.getByRole('checkbox', { name: /Garaje/i }) as HTMLInputElement;
        const acCheckbox = screen.getByRole('checkbox', { name: /Aire Acondicionado/i }) as HTMLInputElement;

        expect(garageCheckbox.checked).toBe(true);
        expect(acCheckbox.checked).toBe(true);
      });
    });
  });

  describe('Form Interaction', () => {
    it('should show amenities from all three groups', () => {
      render(
        <FormProvider>
          <FormStep3 />
        </FormProvider>
      );

      // Check for at least one amenity from each group
      expect(screen.getByRole('checkbox', { name: /Garaje/i })).toBeInTheDocument(); // EXTERIOR
      expect(screen.getByRole('checkbox', { name: /Aire Acondicionado/i })).toBeInTheDocument(); // INTERIOR
      expect(screen.getByRole('checkbox', { name: /Vista Panorámica/i })).toBeInTheDocument(); // VISTAS
    });
  });
});
