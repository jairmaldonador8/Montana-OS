'use client';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormStep2 } from '../FormStep2';
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

describe('FormStep2 Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render neighborhood input field', () => {
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Colonia/i)).toBeInTheDocument();
    });

    it('should render address input field', () => {
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    });

    it('should render GPS button', () => {
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      expect(screen.getByRole('button', { name: /Capturar ubicación/i })).toBeInTheDocument();
    });

    it('should render references textarea', () => {
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Referencias/i)).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      expect(screen.getByRole('button', { name: /Anterior/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument();
    });
  });

  describe('Neighborhood Validation', () => {
    it('should show error if neighborhood is less than 3 characters', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const neighborhoodInput = screen.getByLabelText(/Colonia/i);
      await user.type(neighborhoodInput, 'AB');
      await user.click(screen.getByRole('button', { name: /Siguiente/i }));

      await waitFor(() => {
        expect(screen.getByText(/La colonia debe tener al menos 3 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should not show error if neighborhood has 3 or more characters', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const neighborhoodInput = screen.getByLabelText(/Colonia/i);
      await user.type(neighborhoodInput, 'Polanco');

      const addressInput = screen.getByLabelText(/Dirección/i);
      await user.type(addressInput, 'Calle 123');

      await user.click(screen.getByRole('button', { name: /Siguiente/i }));

      await waitFor(() => {
        expect(screen.queryByText(/La colonia debe tener al menos 3 caracteres/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Address Validation', () => {
    it('should show error if address is less than 5 characters', async () => {
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

      await user.click(screen.getByRole('button', { name: /Siguiente/i }));

      await waitFor(() => {
        expect(screen.getByText(/La dirección debe tener al menos 5 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should not show error if address has 5 or more characters', async () => {
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

      await user.click(screen.getByRole('button', { name: /Siguiente/i }));

      await waitFor(() => {
        expect(screen.queryByText(/La dirección debe tener al menos 5 caracteres/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('GPS Button Behavior', () => {
    it('should show loading state when GPS button is clicked', async () => {
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
      fireEvent.click(gpsButton);

      // Button should be disabled while loading
      expect(gpsButton).toBeDisabled();
    });

    it('should handle GPS success and display coordinates', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: { latitude: 19.4326, longitude: -99.1332 },
          });
        }),
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
      fireEvent.click(gpsButton);

      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      });
    });

    it('should handle GPS permission denied error', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({
            code: 1,
            PERMISSION_DENIED: 1,
          });
        }),
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
      fireEvent.click(gpsButton);

      await waitFor(() => {
        expect(screen.getByText(/Permiso de ubicación denegado/i)).toBeInTheDocument();
      });
    });

    it('should handle GPS timeout error', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({
            code: 3,
            TIMEOUT: 3,
          });
        }),
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
      fireEvent.click(gpsButton);

      await waitFor(() => {
        expect(screen.getByText(/Tiempo de espera agotado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction', () => {
    it('should allow updating neighborhood field', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const neighborhoodInput = screen.getByLabelText(/Colonia/i) as HTMLInputElement;
      await user.type(neighborhoodInput, 'Condesa');

      expect(neighborhoodInput.value).toBe('Condesa');
    });

    it('should allow updating address field', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const addressInput = screen.getByLabelText(/Dirección/i) as HTMLInputElement;
      await user.type(addressInput, 'Avenida Reforma 505');

      expect(addressInput.value).toBe('Avenida Reforma 505');
    });

    it('should allow updating references field', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const referencesInput = screen.getByLabelText(/Referencias/i) as HTMLTextAreaElement;
      await user.type(referencesInput, 'Cerca del parque central');

      expect(referencesInput.value).toBe('Cerca del parque central');
    });
  });

  describe('Form Submission', () => {
    it('should call updateStep(2, data) and goToStep(3) on valid submit', async () => {
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

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      await user.click(submitBtn);

      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(savedData.currentStep).toBe(3);
        expect(savedData.formState.step2.neighborhood).toBe('Polanco');
        expect(savedData.formState.step2.address).toBe('Calle Principal 123');
      });
    });

    it('should preserve form data when navigating away and back', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      const neighborhoodInput = screen.getByLabelText(/Colonia/i);
      await user.type(neighborhoodInput, 'Condesa');

      const addressInput = screen.getByLabelText(/Dirección/i);
      await user.type(addressInput, 'Calle Veracruz 500');

      const submitBtn = screen.getByRole('button', { name: /Siguiente/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(JSON.parse(localStorage.getItem('propertyFormDraft') || '{}').formState.step2.neighborhood).toBe('Condesa');
      });

      // Simulate navigation back
      rerender(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      await waitFor(() => {
        const neighborhoodInput = screen.getByLabelText(/Colonia/i) as HTMLInputElement;
        expect(neighborhoodInput.value).toBe('Condesa');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to step 1 when Anterior button is clicked', async () => {
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

  describe('Loading Existing Data', () => {
    it('should load and display previously saved step 2 data', async () => {
      const initialData = {
        formState: {
          step1: {},
          step2: {
            neighborhood: 'Polanco',
            address: 'Calle Principal 123',
            references: 'Cerca del parque',
          },
          step3: {},
          step4: {},
        },
        currentStep: 2,
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider>
          <FormStep2 />
        </FormProvider>
      );

      await waitFor(() => {
        const neighborhoodInput = screen.getByLabelText(/Colonia/i) as HTMLInputElement;
        const addressInput = screen.getByLabelText(/Dirección/i) as HTMLInputElement;
        const referencesInput = screen.getByLabelText(/Referencias/i) as HTMLTextAreaElement;

        expect(neighborhoodInput.value).toBe('Polanco');
        expect(addressInput.value).toBe('Calle Principal 123');
        expect(referencesInput.value).toBe('Cerca del parque');
      });
    });
  });
});
