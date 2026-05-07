'use client';

import { Droppable } from '@hello-pangea/dnd';
import { Lead, LeadStatus } from '@/types/pipeline';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  lead_nuevo: { label: 'Lead Nuevo', color: 'bg-blue-100 border-blue-300' },
  interesado: { label: 'Interesado', color: 'bg-purple-100 border-purple-300' },
  pendiente_respuesta: { label: 'Pendiente Respuesta', color: 'bg-orange-100 border-orange-300' },
  en_visita: { label: 'En Visita', color: 'bg-cyan-100 border-cyan-300' },
  propuesta_enviada: { label: 'Propuesta Enviada', color: 'bg-amber-100 border-amber-300' },
  cerrado: { label: 'Cerrado', color: 'bg-green-100 border-green-300' },
  no_interesado: { label: 'No Interesado', color: 'bg-gray-100 border-gray-300' },
};

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onLeadClick?: (lead: Lead) => void;
}

export function KanbanColumn({ status, leads, onLeadClick }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];
  const leadCount = leads.length;

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-[320px] max-w-[400px]">
      {/* Column Header */}
      <div className={cn(
        'rounded-lg border-2 px-4 py-3',
        config.color
      )}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">
            {config.label}
          </h3>
          <span className="bg-white/60 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {leadCount}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status} type={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 rounded-lg p-3 min-h-[300px] space-y-2 transition-colors',
              snapshot.isDraggingOver
                ? 'bg-secondary/50 border-2 border-dashed border-primary'
                : 'bg-card border border-border'
            )}
          >
            {/* Leads list */}
            {leads.length > 0 ? (
              leads.map((lead, index) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  index={index}
                  onClick={() => onLeadClick?.(lead)}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">No hay leads en este estado</p>
              </div>
            )}

            {/* Drop indicator */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
