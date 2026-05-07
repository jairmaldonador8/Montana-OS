'use client';

import { useState, useEffect } from 'react';

interface AutosaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'draft_saving' | 'draft_saved' | null;
}

export function AutosaveIndicator({ status }: AutosaveIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show component when status is not null
    if (status !== null) {
      setIsVisible(true);
    }

    // Auto-hide after 2 seconds when status is 'saved'
    if (status === 'saved') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  // Return null when not visible
  if (!isVisible) {
    return null;
  }

  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return {
          text: 'Guardando...',
          className: 'text-gray-500',
        };
      case 'saved':
        return {
          text: '✓ Guardado',
          className: 'text-green-500 font-medium',
        };
      case 'draft_saving':
        return {
          text: '💾 Guardando como borrador...',
          className: 'text-amber-500',
        };
      case 'draft_saved':
        return {
          text: '✓ Borrador guardado',
          className: 'text-amber-400 font-medium',
        };
      case 'error':
        return {
          text: '⚠ Error al guardar',
          className: 'text-red-500',
        };
      case 'idle':
      default:
        return {
          text: '',
          className: '',
        };
    }
  };

  const { text, className } = getStatusContent();

  return (
    <div className={`fixed bottom-4 right-4 text-sm pointer-events-none ${className}`}>
      {text}
    </div>
  );
}
