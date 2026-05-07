'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Lead } from '@/types/pipeline';
import { cn } from '@/lib/utils';
import { Clock, Mail, MessageSquare } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  index: number;
  onClick?: () => void;
}

export function LeadCard({ lead, index, onClick }: LeadCardProps) {
  // Color coding based on dias_en_pipeline
  const getAgeColor = (dias: number): string => {
    if (dias < 1) {
      // Green - less than 1 day
      return 'border-l-4 border-l-green-500 bg-green-50';
    } else if (dias < 4) {
      // Yellow - less than 4 days
      return 'border-l-4 border-l-yellow-500 bg-yellow-50';
    } else {
      // Red - 4+ days
      return 'border-l-4 border-l-red-500 bg-red-50';
    }
  };

  const getDaysLabel = (dias: number): string => {
    if (dias < 1) return '< 1 día';
    if (dias === 1) return '1 día';
    return `${Math.floor(dias)} días`;
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            'p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-move',
            getAgeColor(lead.dias_en_pipeline),
            snapshot.isDragging && 'shadow-lg opacity-90'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {lead.nombre}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lead.property_id}
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded whitespace-nowrap">
              {getDaysLabel(lead.dias_en_pipeline)}
            </span>
          </div>

          {/* Contact info */}
          <div className="space-y-1.5 mb-2">
            {lead.whatsapp && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{lead.whatsapp}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            {lead.fuente && (
              <span className="text-muted-foreground">
                {lead.fuente}
              </span>
            )}
            {lead.last_contact && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(lead.last_contact).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Notes preview */}
          {lead.notas && (
            <div className="mt-2 pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {lead.notas}
              </p>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
