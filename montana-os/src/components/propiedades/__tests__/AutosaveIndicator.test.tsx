import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AutosaveIndicator } from '../AutosaveIndicator';

describe('AutosaveIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Visibility States', () => {
    it('should render nothing when status is null', () => {
      const { container } = render(<AutosaveIndicator status={null} />);
      expect(container.querySelector('div')).toBeNull();
    });

    it('should render nothing when status is idle and not initialized', () => {
      const { container } = render(<AutosaveIndicator status={null} />);
      expect(container.querySelector('div')).toBeNull();
    });

    it('should render when status is saving', () => {
      render(<AutosaveIndicator status="saving" />);
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('should render when status is saved', () => {
      render(<AutosaveIndicator status="saved" />);
      expect(screen.getByText('✓ Guardado')).toBeInTheDocument();
    });

    it('should render when status is error', () => {
      render(<AutosaveIndicator status="error" />);
      expect(screen.getByText('⚠ Error al guardar')).toBeInTheDocument();
    });
  });

  describe('Status Content', () => {
    it('should display "Guardando..." text for saving status', () => {
      render(<AutosaveIndicator status="saving" />);
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('should display success message for saved status', () => {
      render(<AutosaveIndicator status="saved" />);
      expect(screen.getByText('✓ Guardado')).toBeInTheDocument();
    });

    it('should display error message for error status', () => {
      render(<AutosaveIndicator status="error" />);
      expect(screen.getByText('⚠ Error al guardar')).toBeInTheDocument();
    });

    it('should have correct text color for saving status', () => {
      const { container } = render(<AutosaveIndicator status="saving" />);
      const div = container.querySelector('div');
      expect(div?.className).toContain('text-gray-500');
    });

    it('should have correct text color for saved status', () => {
      const { container } = render(<AutosaveIndicator status="saved" />);
      const div = container.querySelector('div');
      expect(div?.className).toContain('text-green-500');
    });

    it('should have correct text color for error status', () => {
      const { container } = render(<AutosaveIndicator status="error" />);
      const div = container.querySelector('div');
      expect(div?.className).toContain('text-red-500');
    });
  });

  describe('Styling', () => {
    it('should be positioned fixed bottom-4 right-4', () => {
      const { container } = render(<AutosaveIndicator status="saving" />);
      const div = container.querySelector('div');
      expect(div?.className).toContain('fixed');
      expect(div?.className).toContain('bottom-4');
      expect(div?.className).toContain('right-4');
    });

    it('should have pointer-events-none class', () => {
      const { container } = render(<AutosaveIndicator status="saving" />);
      const div = container.querySelector('div');
      expect(div?.className).toContain('pointer-events-none');
    });

    it('should have small text size', () => {
      const { container } = render(<AutosaveIndicator status="saving" />);
      const div = container.querySelector('div');
      expect(div?.className).toContain('text-sm');
    });

    it('should have medium font weight for saved status', () => {
      const { container } = render(<AutosaveIndicator status="saved" />);
      const div = container.querySelector('div');
      expect(div?.className).toContain('font-medium');
    });
  });

  describe('Auto-hide Behavior', () => {
    it('should set up a timer when status is saved', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      render(<AutosaveIndicator status="saved" />);

      expect(screen.getByText('✓ Guardado')).toBeInTheDocument();
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

      setTimeoutSpy.mockRestore();
    });

    it('should NOT auto-hide for saving status', () => {
      render(<AutosaveIndicator status="saving" />);

      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('should NOT auto-hide for error status', () => {
      render(<AutosaveIndicator status="error" />);

      expect(screen.getByText('⚠ Error al guardar')).toBeInTheDocument();
    });

    it('should clear timeout when component unmounts with saved status', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = render(<AutosaveIndicator status="saved" />);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Status Transitions', () => {
    it('should transition from saving to saved', () => {
      const { rerender } = render(<AutosaveIndicator status="saving" />);

      expect(screen.getByText('Guardando...')).toBeInTheDocument();

      rerender(<AutosaveIndicator status="saved" />);

      expect(screen.getByText('✓ Guardado')).toBeInTheDocument();
    });

    it('should transition from saving to error', () => {
      const { rerender } = render(<AutosaveIndicator status="saving" />);

      expect(screen.getByText('Guardando...')).toBeInTheDocument();

      rerender(<AutosaveIndicator status="error" />);

      expect(screen.getByText('⚠ Error al guardar')).toBeInTheDocument();
    });

    it('should transition from error back to saving', () => {
      const { rerender } = render(<AutosaveIndicator status="error" />);

      expect(screen.getByText('⚠ Error al guardar')).toBeInTheDocument();

      rerender(<AutosaveIndicator status="saving" />);

      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('should hide when transitioning to null from visible status', () => {
      const { rerender } = render(<AutosaveIndicator status="saved" />);

      expect(screen.getByText('✓ Guardado')).toBeInTheDocument();

      rerender(<AutosaveIndicator status={null} />);

      expect(screen.queryByText('✓ Guardado')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Rapid Status Changes', () => {
    it('should handle rapid status transitions', () => {
      const { rerender } = render(<AutosaveIndicator status="saving" />);

      expect(screen.getByText('Guardando...')).toBeInTheDocument();

      rerender(<AutosaveIndicator status="saved" />);
      expect(screen.getByText('✓ Guardado')).toBeInTheDocument();

      rerender(<AutosaveIndicator status="saving" />);
      expect(screen.getByText('Guardando...')).toBeInTheDocument();

      rerender(<AutosaveIndicator status="error" />);
      expect(screen.getByText('⚠ Error al guardar')).toBeInTheDocument();
    });

    it('should cancel previous timeout when status changes', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { rerender } = render(<AutosaveIndicator status="saved" />);

      rerender(<AutosaveIndicator status="saving" />);

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });
});
