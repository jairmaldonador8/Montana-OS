'use client';

import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface ConfirmIncompleteDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmIncompleteDialog({
  open,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmIncompleteDialogProps) {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Content className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onCancel}
        />

        {/* Dialog Box */}
        <div className="relative bg-white rounded-lg shadow-lg max-w-md p-6 space-y-4">
          <div className="space-y-2">
            <AlertDialog.Title className="text-lg font-bold text-gray-900">
              Subir propiedad incompleta
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600">
              Esta propiedad no tiene toda la información completa. Podrás modificarla y completarla después desde el panel de propiedades.
            </AlertDialog.Description>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-amber-900">⚠️ Campos incompletos:</p>
            <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
              <li>La propiedad será guardada como borrador</li>
              <li>Podrás editarla en cualquier momento</li>
              <li>No aparecerá en el catálogo hasta completarla</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <AlertDialog.Cancel asChild>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Subiendo...' : 'Subir de todas formas'}
              </button>
            </AlertDialog.Action>
          </div>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
