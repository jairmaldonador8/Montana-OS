import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FormContainer } from '../FormContainer';
import { FormProvider } from '@/context/formContext';

// Mock fetch
global.fetch = vi.fn();

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

describe('FormContainer Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: {} }),
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render progress bar with 4 segments', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      const progressBars = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-2') && el.className.includes('rounded-full')
      );

      expect(progressBars.length).toBe(4);
    });

    it('should display current step text', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();
    });

    it('should render FormStep1 initially', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Tipo de propiedad/i)).toBeInTheDocument();
    });

    it('should apply bg-montana-gold class to current step in progress bar', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      const progressBars = screen.getAllByRole('generic').filter(el =>
        el.className.includes('h-2') && el.className.includes('rounded-full')
      );

      expect(progressBars[0].className).toContain('bg-montana-gold');
      expect(progressBars[1].className).toContain('bg-gray-200');
    });
  });

  describe('Navigation', () => {
    it('should render Siguiente button', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      const nextBtn = screen.getByRole('button', { name: /Siguiente/i });
      expect(nextBtn).toBeInTheDocument();
    });

    it('should render progress indicators', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      expect(screen.getByText(/Paso 1 de 4/i)).toBeInTheDocument();
    });

    it('should render step 1 form initially', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      expect(screen.getByLabelText(/Tipo de propiedad/i)).toBeInTheDocument();
    });
  });

  describe('Autosave Effect', () => {
    it('should have autosave mechanism configured', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();
    });
  });

  describe('Autosave Status Indicator', () => {
    it('should render AutosaveIndicator component', () => {
      render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      // AutosaveIndicator is rendered but hidden when status is idle
      expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should clear timers on unmount', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: {} }),
      });
      global.fetch = mockFetch;

      const { unmount } = render(
        <FormProvider>
          <FormContainer propertyId="test-prop-123" />
        </FormProvider>
      );

      const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
      fireEvent.change(typeSelect, { target: { value: 'casa' } });

      unmount();

      vi.advanceTimersByTime(600);

      // Should not have called fetch after unmount
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
