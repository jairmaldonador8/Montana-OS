'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Lead, LeadStatus } from '@/types/pipeline';
import { KanbanColumn } from './KanbanColumn';
import { LeadSidebar } from './LeadSidebar';
import { usePipelineLeads } from '@/hooks/usePipelineLeads';
import { cn } from '@/lib/utils';

const STATUSES: LeadStatus[] = [
  'lead_nuevo',
  'interesado',
  'pendiente_respuesta',
  'en_visita',
  'propuesta_enviada',
  'cerrado',
  'no_interesado',
];

interface KanbanBoardProps {
  filters?: {
    assigned_to?: string;
  };
}

export function KanbanBoard({ filters }: KanbanBoardProps) {
  const { leads, loading, error, updateStatus } = usePipelineLeads(filters);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Group leads by status
  const leadsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = leads.filter((lead) => lead.status === status);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  // Handle drag and drop
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      // If dropped outside a valid droppable area or in the same position
      if (!destination) {
        return;
      }

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      // Get the new status from destination
      const newStatus = destination.droppableId as LeadStatus;

      // Update the lead status
      try {
        setIsUpdating(true);
        await updateStatus(draggableId, newStatus);
        // Clear sidebar if the selected lead was updated
        if (selectedLead?.id === draggableId) {
          setSelectedLead((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      } catch (err) {
        console.error('Failed to update lead status:', err);
        // The hook will handle showing an error
      } finally {
        setIsUpdating(false);
      }
    },
    [updateStatus, selectedLead?.id]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar el pipeline</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* Main Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 p-4 h-fit min-w-max">
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                leads={leadsByStatus[status]}
                onLeadClick={setSelectedLead}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Lead Sidebar */}
      {selectedLead && (
        <LeadSidebar
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdate={setSelectedLead}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}
