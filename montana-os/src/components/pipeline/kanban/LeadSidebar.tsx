'use client';

import { useState } from 'react';
import { Lead, LeadStatus } from '@/types/pipeline';
import { cn } from '@/lib/utils';
import {
  X,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'lead_nuevo', label: 'Lead Nuevo' },
  { value: 'interesado', label: 'Interesado' },
  { value: 'pendiente_respuesta', label: 'Pendiente Respuesta' },
  { value: 'en_visita', label: 'En Visita' },
  { value: 'propuesta_enviada', label: 'Propuesta Enviada' },
  { value: 'cerrado', label: 'Cerrado' },
  { value: 'no_interesado', label: 'No Interesado' },
];

interface LeadSidebarProps {
  lead: Lead;
  onClose: () => void;
  onLeadUpdate: (lead: Lead) => void;
  isUpdating?: boolean;
}

export function LeadSidebar({
  lead,
  onClose,
  onLeadUpdate,
  isUpdating = false,
}: LeadSidebarProps) {
  const [notes, setNotes] = useState(lead.notas || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const getAgeColor = (dias: number): string => {
    if (dias < 1) return 'text-green-600 bg-green-50';
    if (dias < 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAgeLabel = (dias: number): string => {
    if (dias < 1) return '< 1 día en pipeline';
    if (dias === 1) return '1 día en pipeline';
    return `${Math.floor(dias)} días en pipeline`;
  };

  const getStatusColor = (status: LeadStatus): string => {
    const colors: Record<LeadStatus, string> = {
      lead_nuevo: 'bg-blue-100 text-blue-700',
      interesado: 'bg-purple-100 text-purple-700',
      pendiente_respuesta: 'bg-orange-100 text-orange-700',
      en_visita: 'bg-cyan-100 text-cyan-700',
      propuesta_enviada: 'bg-amber-100 text-amber-700',
      cerrado: 'bg-green-100 text-green-700',
      no_interesado: 'bg-gray-100 text-gray-700',
    };
    return colors[status];
  };

  const formatDate = (date: string | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSaveNotes = () => {
    // TODO: Implement notes update API call
    setIsEditingNotes(false);
  };

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col shadow-lg animate-in slide-in-from-right">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{lead.nombre}</h2>
          <p className="text-sm text-muted-foreground mt-1">{lead.property_id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          disabled={isUpdating}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status and Age */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">ESTADO</span>
          </div>
          <div className={cn(
            'px-3 py-2 rounded-lg font-medium text-sm inline-block',
            getStatusColor(lead.status)
          )}>
            {STATUS_OPTIONS.find(s => s.value === lead.status)?.label || lead.status}
          </div>
        </div>

        {/* Days in Pipeline */}
        <div className={cn(
          'rounded-lg p-3 flex items-center gap-3',
          getAgeColor(lead.dias_en_pipeline)
        )}>
          <Clock className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">{getAgeLabel(lead.dias_en_pipeline)}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Información de Contacto
          </h3>

          {lead.whatsapp && (
            <div className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="text-sm font-medium truncate">{lead.whatsapp}</p>
              </div>
              <a
                href={`https://wa.me/${lead.whatsapp.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Enviar
              </a>
            </div>
          )}

          {lead.email && (
            <div className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{lead.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Lead Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Detalles
          </h3>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Fuente</p>
              <p className="text-sm font-medium">{lead.fuente || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Asignado a</p>
              <p className="text-sm font-medium">{lead.assigned_to || 'Sin asignar'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Creado</p>
              <p className="text-sm font-medium">{formatDate(lead.created_at)}</p>
            </div>

            {lead.last_contact && (
              <div>
                <p className="text-xs text-muted-foreground">Último contacto</p>
                <p className="text-sm font-medium">{formatDate(lead.last_contact)}</p>
              </div>
            )}

            {lead.status_updated_at && (
              <div>
                <p className="text-xs text-muted-foreground">Estado actualizado</p>
                <p className="text-sm font-medium">{formatDate(lead.status_updated_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notas
          </h3>

          {isEditingNotes ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas..."
                className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  className="flex-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setNotes(lead.notas || '');
                    setIsEditingNotes(false);
                  }}
                  className="flex-1 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingNotes(true)}
              className="p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors min-h-[80px] text-sm"
            >
              {notes ? (
                <p className="text-foreground">{notes}</p>
              ) : (
                <p className="text-muted-foreground italic">Hacer clic para agregar notas...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Call to Action */}
      <div className="border-t border-border p-4 bg-secondary/20 space-y-2">
        {lead.status !== 'cerrado' && lead.status !== 'no_interesado' && (
          <button className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Próximo paso
          </button>
        )}
        <button className="w-full px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
          Ver detalles completos
        </button>
      </div>
    </div>
  );
}
