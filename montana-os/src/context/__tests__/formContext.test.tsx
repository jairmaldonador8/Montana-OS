import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { FormProvider, useForm } from '../formContext';

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

describe('FormContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Test Component that uses the form context
  const TestComponent = ({ testId }: { testId: string }) => {
    const { formState, currentStep, updateStep, goToStep, resetForm, getStepData } = useForm();

    return (
      <div>
        <div data-testid={`step-${testId}`}>
          Current Step: {currentStep}
        </div>
        <div data-testid="form-state">
          {JSON.stringify(formState)}
        </div>
        <button
          onClick={() => updateStep(1, { type: 'casa', operation: 'venta', price: 100000 })}
          data-testid="update-step-1"
        >
          Update Step 1
        </button>
        <button
          onClick={() => updateStep(2, { neighborhood: 'Test', address: '123 Test St' })}
          data-testid="update-step-2"
        >
          Update Step 2
        </button>
        <button
          onClick={() => goToStep(2)}
          data-testid="go-to-step-2"
        >
          Go to Step 2
        </button>
        <button
          onClick={() => goToStep(3)}
          data-testid="go-to-step-3"
        >
          Go to Step 3
        </button>
        <button
          onClick={() => resetForm()}
          data-testid="reset-form"
        >
          Reset Form
        </button>
        <div data-testid="step-1-data">
          {JSON.stringify(getStepData(1))}
        </div>
      </div>
    );
  };

  describe('Initialize with empty state', () => {
    it('should initialize with empty form state and step 1', () => {
      render(
        <FormProvider>
          <TestComponent testId="init" />
        </FormProvider>
      );

      expect(screen.getByTestId('step-init')).toHaveTextContent('Current Step: 1');
      const formState = JSON.parse(screen.getByTestId('form-state').textContent || '{}');
      expect(formState).toEqual({
        step1: {},
        step2: {},
        step3: {},
        step4: {},
      });
    });

    it('should initialize with propertyId if provided', async () => {
      render(
        <FormProvider propertyId="test-property-123">
          <TestComponent testId="init-with-id" />
        </FormProvider>
      );

      await waitFor(() => {
        expect(localStorage.getItem('propertyFormDraft')).toBeDefined();
        const saved = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(saved.propertyId).toBe('test-property-123');
      });
    });
  });

  describe('Update step data', () => {
    it('should update step 1 data', async () => {
      render(
        <FormProvider>
          <TestComponent testId="update" />
        </FormProvider>
      );

      const updateBtn = screen.getByTestId('update-step-1');
      updateBtn.click();

      await waitFor(() => {
        const stepData = JSON.parse(screen.getByTestId('step-1-data').textContent || '{}');
        expect(stepData).toEqual({
          type: 'casa',
          operation: 'venta',
          price: 100000,
        });
      });
    });

    it('should update step 2 data', async () => {
      render(
        <FormProvider>
          <TestComponent testId="update" />
        </FormProvider>
      );

      const updateBtn = screen.getByTestId('update-step-2');
      updateBtn.click();

      await waitFor(() => {
        const formState = JSON.parse(screen.getByTestId('form-state').textContent || '{}');
        expect(formState.step2).toEqual({
          neighborhood: 'Test',
          address: '123 Test St',
        });
      });
    });

    it('should persist updated step data to localStorage', async () => {
      render(
        <FormProvider>
          <TestComponent testId="persist" />
        </FormProvider>
      );

      const updateBtn = screen.getByTestId('update-step-1');
      updateBtn.click();

      await waitFor(() => {
        const saved = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(saved.formState.step1).toEqual({
          type: 'casa',
          operation: 'venta',
          price: 100000,
        });
      });
    });
  });

  describe('Navigate between steps', () => {
    it('should change current step', async () => {
      render(
        <FormProvider>
          <TestComponent testId="nav" />
        </FormProvider>
      );

      expect(screen.getByTestId('step-nav')).toHaveTextContent('Current Step: 1');

      const goToStep2Btn = screen.getByTestId('go-to-step-2');
      goToStep2Btn.click();

      await waitFor(() => {
        expect(screen.getByTestId('step-nav')).toHaveTextContent('Current Step: 2');
      });
    });

    it('should persist step navigation to localStorage', async () => {
      render(
        <FormProvider>
          <TestComponent testId="nav-persist" />
        </FormProvider>
      );

      const goToStep3Btn = screen.getByTestId('go-to-step-3');
      goToStep3Btn.click();

      await waitFor(() => {
        const saved = JSON.parse(localStorage.getItem('propertyFormDraft') || '{}');
        expect(saved.currentStep).toBe(3);
      });
    });

    it('should navigate between multiple steps', async () => {
      render(
        <FormProvider>
          <TestComponent testId="multi-nav" />
        </FormProvider>
      );

      const goToStep2Btn = screen.getByTestId('go-to-step-2');
      const goToStep3Btn = screen.getByTestId('go-to-step-3');

      goToStep2Btn.click();
      await waitFor(() => {
        expect(screen.getByTestId('step-multi-nav')).toHaveTextContent('Current Step: 2');
      });

      goToStep3Btn.click();
      await waitFor(() => {
        expect(screen.getByTestId('step-multi-nav')).toHaveTextContent('Current Step: 3');
      });
    });
  });

  describe('Reset form', () => {
    it('should reset form to empty state', async () => {
      render(
        <FormProvider>
          <TestComponent testId="reset" />
        </FormProvider>
      );

      const updateBtn = screen.getByTestId('update-step-1');
      updateBtn.click();

      await waitFor(() => {
        const stepData = JSON.parse(screen.getByTestId('step-1-data').textContent || '{}');
        expect(stepData).toEqual({
          type: 'casa',
          operation: 'venta',
          price: 100000,
        });
      });

      const resetBtn = screen.getByTestId('reset-form');
      resetBtn.click();

      await waitFor(() => {
        const formState = JSON.parse(screen.getByTestId('form-state').textContent || '{}');
        expect(formState).toEqual({
          step1: {},
          step2: {},
          step3: {},
          step4: {},
        });
      });
    });

    it('should reset current step to 1', async () => {
      render(
        <FormProvider>
          <TestComponent testId="reset-step" />
        </FormProvider>
      );

      const goToStep2Btn = screen.getByTestId('go-to-step-2');
      goToStep2Btn.click();

      await waitFor(() => {
        expect(screen.getByTestId('step-reset-step')).toHaveTextContent('Current Step: 2');
      });

      const resetBtn = screen.getByTestId('reset-form');
      resetBtn.click();

      await waitFor(() => {
        expect(screen.getByTestId('step-reset-step')).toHaveTextContent('Current Step: 1');
      });
    });

    it('should clear localStorage after reset', async () => {
      render(
        <FormProvider>
          <TestComponent testId="reset-localStorage" />
        </FormProvider>
      );

      const updateBtn = screen.getByTestId('update-step-1');
      updateBtn.click();

      await waitFor(() => {
        expect(localStorage.getItem('propertyFormDraft')).toBeDefined();
      });

      const resetBtn = screen.getByTestId('reset-form');
      resetBtn.click();

      await waitFor(() => {
        expect(localStorage.getItem('propertyFormDraft')).toBeNull();
      });
    });
  });

  describe('Persist and recover from localStorage', () => {
    it('should load form data from localStorage on mount', async () => {
      const initialData = {
        formState: {
          step1: { type: 'departamento', operation: 'renta', price: 5000 },
          step2: {},
          step3: {},
          step4: {},
        },
        currentStep: 2,
        propertyId: 'prop-123',
      };

      localStorage.setItem('propertyFormDraft', JSON.stringify(initialData));

      render(
        <FormProvider>
          <TestComponent testId="recover" />
        </FormProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('step-recover')).toHaveTextContent('Current Step: 2');
        const stepData = JSON.parse(screen.getByTestId('step-1-data').textContent || '{}');
        expect(stepData).toEqual({
          type: 'departamento',
          operation: 'renta',
          price: 5000,
        });
      });
    });

    it('should survive page refresh (localStorage persistence)', async () => {
      const { unmount } = render(
        <FormProvider>
          <TestComponent testId="refresh" />
        </FormProvider>
      );

      const updateBtn = screen.getByTestId('update-step-1');
      updateBtn.click();

      await waitFor(() => {
        expect(localStorage.getItem('propertyFormDraft')).toBeDefined();
      });

      const savedData = localStorage.getItem('propertyFormDraft');
      unmount();

      // Simulate page refresh by rendering again
      render(
        <FormProvider>
          <TestComponent testId="refresh" />
        </FormProvider>
      );

      await waitFor(() => {
        const stepData = JSON.parse(screen.getByTestId('step-1-data').textContent || '{}');
        expect(stepData).toEqual({
          type: 'casa',
          operation: 'venta',
          price: 100000,
        });
      });
    });
  });

  describe('useForm hook', () => {
    it('should throw error when used outside FormProvider', () => {
      // Create a component that uses useForm without provider
      const ComponentWithoutProvider = () => {
        useForm();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<ComponentWithoutProvider />);
      }).toThrow('useForm must be used within FormProvider');

      spy.mockRestore();
    });

    it('should return context values correctly', () => {
      const TestHookComponent = () => {
        const { formState, currentStep, updateStep, goToStep, resetForm, getStepData } = useForm();

        return (
          <div>
            <div data-testid="has-formState">{formState ? 'yes' : 'no'}</div>
            <div data-testid="has-currentStep">{currentStep ? 'yes' : 'no'}</div>
            <div data-testid="has-updateStep">{typeof updateStep === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-goToStep">{typeof goToStep === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-resetForm">{typeof resetForm === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-getStepData">{typeof getStepData === 'function' ? 'yes' : 'no'}</div>
          </div>
        );
      };

      render(
        <FormProvider>
          <TestHookComponent />
        </FormProvider>
      );

      expect(screen.getByTestId('has-formState')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-currentStep')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-updateStep')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-goToStep')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-resetForm')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-getStepData')).toHaveTextContent('yes');
    });
  });

  describe('Hydration handling', () => {
    it('should wait for client mount before rendering', async () => {
      const TestHydrationComponent = () => {
        const { formState } = useForm();
        return <div data-testid="hydrated">{Object.keys(formState).length > 0 ? 'hydrated' : 'loading'}</div>;
      };

      render(
        <FormProvider>
          <TestHydrationComponent />
        </FormProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('hydrated')).toHaveTextContent('hydrated');
      });
    });

    it('should handle initial render without localStorage data', () => {
      localStorage.clear();

      render(
        <FormProvider>
          <TestComponent testId="hydration-empty" />
        </FormProvider>
      );

      expect(screen.getByTestId('step-hydration-empty')).toHaveTextContent('Current Step: 1');
    });
  });

  describe('getStepData function', () => {
    it('should return data for requested step', async () => {
      render(
        <FormProvider>
          <TestComponent testId="get-step" />
        </FormProvider>
      );

      const updateBtn = screen.getByTestId('update-step-1');
      updateBtn.click();

      await waitFor(() => {
        const stepData = JSON.parse(screen.getByTestId('step-1-data').textContent || '{}');
        expect(stepData).toHaveProperty('type');
        expect(stepData).toHaveProperty('operation');
        expect(stepData).toHaveProperty('price');
      });
    });

    it('should return empty object for uninitialized step', () => {
      render(
        <FormProvider>
          <TestComponent testId="get-empty" />
        </FormProvider>
      );

      const stepData = JSON.parse(screen.getByTestId('step-1-data').textContent || '{}');
      expect(stepData).toEqual({});
    });
  });
});
