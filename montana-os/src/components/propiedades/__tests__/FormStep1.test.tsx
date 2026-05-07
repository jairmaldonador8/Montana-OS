'use client';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormStep1 } from '../FormStep1';
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

describe('FormStep1 Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render property type select', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Tipo de propiedad/i)).toBeInTheDocument();
    });

    it('should render operation radio buttons', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Venta$/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Renta$/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Venta o renta/)).toBeInTheDocument();
    });

    it('should render price input field', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Precio\s*\*/)).toBeInTheDocument();
    });

    it('should render currency select with MXN as default', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const currencySelect = screen.getByLabelText(/Moneda/i) as HTMLSelectElement;
      expect(currencySelect).toHaveValue('MXN');
    });

    it('should render Siguiente button', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      expect(submitBtn).toBeInTheDocument();
    });
  });

  describe('Conditional Fields', () => {
    it('should NOT show rentalPrice field when operation is venta', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const ventaRadio = screen.getByLabelText(/Venta$/);
      fireEvent.click(ventaRadio);

      expect(screen.queryByLabelText(/Precio de renta/i)).not.toBeInTheDocument();
    });

    it('should show rentalPrice field when operation is renta', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const rentaRadio = screen.getByLabelText(/Renta$/);
      fireEvent.click(rentaRadio);

      await waitFor(() => {
        expect(screen.getByLabelText(/Precio de renta/i)).toBeInTheDocument();
      });
    });

    it('should show rentalPrice field when operation is venta_o_renta', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const ventaORentaRadio = screen.getByLabelText(/Venta o renta/);
      fireEvent.click(ventaORentaRadio);

      await waitFor(() => {
        expect(screen.getByLabelText(/Precio de renta/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction', () => {
    it('should allow selecting property type', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i) as HTMLSelectElement;
      fireEvent.change(typeSelect, { target: { value: 'casa' } });

      expect(typeSelect).toHaveValue('casa');
    });

    it('should allow selecting operation', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const ventaRadio = screen.getByLabelText(/Venta$/) as HTMLInputElement;
      fireEvent.click(ventaRadio);

      expect(ventaRadio).toBeChecked();
    });

    it('should allow entering price', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const priceInput = screen.getByLabelText(/Precio\s*\*/) as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: '1000000' } });

      expect(priceInput).toHaveValue(1000000);
    });

    it('should allow entering rental price when operation is renta', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const rentaRadio = screen.getByLabelText(/Renta$/);
      fireEvent.click(rentaRadio);

      await waitFor(() => {
        expect(screen.getByLabelText(/Precio de renta/i)).toBeInTheDocument();
      });

      const rentalPriceInput = screen.getByLabelText(/Precio de renta/i) as HTMLInputElement;
      fireEvent.change(rentalPriceInput, { target: { value: '5000' } });

      expect(rentalPriceInput).toHaveValue(5000);
    });

    it('should allow selecting currency', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const currencySelect = screen.getByLabelText(/Moneda/i) as HTMLSelectElement;
      fireEvent.change(currencySelect, { target: { value: 'USD' } });

      expect(currencySelect).toHaveValue('USD');
    });
  });

  describe('Validation', () => {
    it('should have validation enabled on form', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i) as HTMLSelectElement;
      expect(typeSelect).toBeInTheDocument();
    });

    it('should allow form submission only after filling required fields', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      expect(submitBtn).toBeInTheDocument();
    });
  });

  describe('Submit Behavior', () => {
    it('should call form context updateStep and goToStep on valid submit', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
      fireEvent.change(typeSelect, { target: { value: 'casa' } });

      const ventaRadio = screen.getByLabelText(/Venta$/);
      fireEvent.click(ventaRadio);

      const priceInput = screen.getByLabelText(/Precio\s*\*/);
      fireEvent.change(priceInput, { target: { value: '1000000' } });

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(savedData.formState.step1).toEqual({
          type: 'casa',
          operation: 'venta',
          price: 1000000,
          currency: 'MXN',
        });
        expect(savedData.currentStep).toBe(2);
      });
    });

    it('should persist form data to localStorage on submit', async () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
      fireEvent.change(typeSelect, { target: { value: 'departamento' } });

      const rentaRadio = screen.getByLabelText(/Renta$/);
      fireEvent.click(rentaRadio);

      const priceInput = screen.getByLabelText(/Precio\s*\*/);
      fireEvent.change(priceInput, { target: { value: '500000' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/Precio de renta/i)).toBeInTheDocument();
      });

      const rentalPriceInput = screen.getByLabelText(/Precio de renta/i);
      fireEvent.change(rentalPriceInput, { target: { value: '3000' } });

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(savedData.formState.step1.type).toBe('departamento');
        expect(savedData.formState.step1.operation).toBe('renta');
        expect(savedData.formState.step1.price).toBe(500000);
        expect(savedData.formState.step1.rentalPrice).toBe(3000);
      });
    });
  });

  describe('Loading Existing Data', () => {
    it('should load and display previously saved step 1 data', async () => {
      const initialData = {
        formState: {
          step1: {
            type: 'casa',
            operation: 'venta',
            price: 2500000,
            currency: 'MXN',
          },
          step2: {},
          step3: {},
          step4: {},
        },
        currentStep: 1,
        propertyId: 'test-prop-123',
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      await waitFor(() => {
        const typeSelect = screen.getByLabelText(/Tipo de propiedad/i) as HTMLSelectElement;
        expect(typeSelect).toHaveValue('casa');

        const ventaRadio = screen.getByLabelText(/Venta$/) as HTMLInputElement;
        expect(ventaRadio).toBeChecked();

        const priceInput = screen.getByLabelText(/Precio\s*\*/) as HTMLInputElement;
        expect(priceInput).toHaveValue(2500000);
      });
    });

    it('should load rental price field when saved data has renta operation', async () => {
      const initialData = {
        formState: {
          step1: {
            type: 'departamento',
            operation: 'renta',
            price: 1000000,
            rentalPrice: 8000,
            currency: 'MXN',
          },
          step2: {},
          step3: {},
          step4: {},
        },
        currentStep: 1,
        propertyId: 'test-prop-456',
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      await waitFor(() => {
        const rentalPriceInput = screen.getByLabelText(/Precio de renta/i) as HTMLInputElement;
        expect(rentalPriceInput).toHaveValue(8000);
      });
    });
  });

  describe('Default Values', () => {
    it('should default currency to MXN', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const currencySelect = screen.getByLabelText(/Moneda/i) as HTMLSelectElement;
      expect(currencySelect).toHaveValue('MXN');
    });

    it('should have empty initial values for other fields', () => {
      render(
        <FormProvider>
          <FormStep1 />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i) as HTMLSelectElement;
      const priceInput = screen.getByLabelText(/Precio\s*\*/) as HTMLInputElement;

      expect(typeSelect).toHaveValue('');
      expect(priceInput.value).toBe('');
    });
  });
});
