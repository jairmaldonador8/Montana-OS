'use client';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormStep4 } from '../FormStep4';
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

// Mock fetch
global.fetch = vi.fn();

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'mock/path.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
      })),
    },
  })),
}));

// Mock GalleryUpload component
vi.mock('../GalleryUpload', () => ({
  GalleryUpload: ({ onComplete }: any) => (
    <div data-testid="gallery-upload">
      <button
        onClick={() => onComplete(['https://example.com/photo1.jpg'])}
        data-testid="complete-upload"
      >
        Complete Upload
      </button>
    </div>
  ),
}));

describe('FormStep4 Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render GalleryUpload component', () => {
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      expect(screen.getByTestId('gallery-upload')).toBeInTheDocument();
    });

    it('should render description textarea', () => {
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    });

    it('should render character counter', () => {
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      expect(screen.getByText(/caracteres/i)).toBeInTheDocument();
    });

    it('should render Enviar a revisión button', () => {
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      expect(screen.getByRole('button', { name: /Enviar a revisión/i })).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    });

    it('should render Anterior button', () => {
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      expect(screen.getByRole('button', { name: /Anterior/i })).toBeInTheDocument();
    });
  });

  describe('Description Field', () => {
    it('should allow entering description text', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement;
      await user.type(descriptionInput, 'Beautiful property with ocean view');

      expect(descriptionInput.value).toBe('Beautiful property with ocean view');
    });

    it('should update character counter when description changes', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test description');

      expect(screen.getByText(/16\/500/i)).toBeInTheDocument();
    });

    it('should have maxLength 500 attribute on textarea', () => {
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement;
      expect(descriptionInput.maxLength).toBe(500);
    });
  });

  describe('Form Submission', () => {
    it('should call updateStep(4, data) on submit', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test property description');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should POST to /api/properties/{id} with all form data', async () => {
      const user = userEvent.setup();
      const propertyId = 'test-prop-123';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const initialData = {
        formState: {
          step1: { type: 'casa', operation: 'venta', price: 1000000 },
          step2: { neighborhood: 'Polanco', address: 'Calle 123' },
          step3: { bedrooms: 3, bathrooms: 2, m2Built: 150 },
          step4: { photos: [], description: '' },
        },
        currentStep: 4,
        propertyId,
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider propertyId={propertyId}>
          <FormStep4 propertyId={propertyId} />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Beautiful home');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/properties/${propertyId}`,
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('should include status pending_review in submission', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test property');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      await waitFor(() => {
        const callArgs = (global.fetch as any).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);
        expect(requestBody.status).toBe('pending_review');
      });
    });

    it('should attempt to clear localStorage on successful submission', async () => {
      const user = userEvent.setup();
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      localStorage.setItem('propertyFormDraft', JSON.stringify({ test: 'data' }));

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test property');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(removeItemSpy).toHaveBeenCalledWith('propertyFormDraft');
      });
    });

    it('should redirect to /dashboard/propiedades on success', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test property');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard/propiedades');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message if submission fails', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test property');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should display API error response message', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid property data' }),
      });

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test property');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Invalid property data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should show confirmation when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelBtn);

      expect(screen.getByRole('button', { name: /¿Confirmar\?/i })).toBeInTheDocument();
    });

    it('should display confirmation message', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelBtn);

      expect(screen.getByText(/Se descartarán todos los cambios/i)).toBeInTheDocument();
    });

    it('should show confirmation state when cancel is clicked twice', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelBtn);

      // First click shows confirmation
      expect(screen.getByRole('button', { name: /¿Confirmar\?/i })).toBeInTheDocument();

      // Verify confirmation message appears
      expect(screen.getByText(/Se descartarán todos los cambios/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to step 3 when Anterior button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const anteriorBtn = screen.getByRole('button', { name: /Anterior/i });
      await user.click(anteriorBtn);

      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(savedData.currentStep).toBe(3);
      });
    });
  });

  describe('Data Persistence', () => {
    it('should load and display previously saved step 4 data', async () => {
      const initialData = {
        formState: {
          step1: {},
          step2: {},
          step3: {},
          step4: {
            photos: ['https://example.com/photo1.jpg'],
            description: 'Beautiful property with great views',
          },
        },
        currentStep: 4,
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      await waitFor(() => {
        const descriptionInput = screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement;
        expect(descriptionInput.value).toBe('Beautiful property with great views');
      });
    });

    it('should preserve description when navigating back and forward', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Wonderful home with pool');

      const anteriorBtn = screen.getByRole('button', { name: /Anterior/i });
      await user.click(anteriorBtn);

      // Simulate navigation back
      rerender(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      await waitFor(() => {
        const descriptionInput = screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement;
        expect(descriptionInput.value).toBe('Wonderful home with pool');
      });
    });
  });

  describe('Submit Button States', () => {
    it('should disable buttons while submitting', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100)
          )
      );

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test property');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      expect(submitBtn).toBeDisabled();
    });

    it('should show loading state in submit button', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100)
          )
      );

      render(
        <FormProvider>
          <FormStep4 propertyId="test-property-1" />
        </FormProvider>
      );

      const descriptionInput = screen.getByLabelText(/Descripción/i);
      await user.type(descriptionInput, 'Test property');

      const submitBtn = screen.getByRole('button', { name: /Enviar a revisión/i });
      await user.click(submitBtn);

      expect(screen.getByRole('button', { name: /Enviando/i })).toBeInTheDocument();
    });
  });
});
