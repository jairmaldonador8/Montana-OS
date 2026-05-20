// Este archivo se regenera automáticamente desde Supabase con:
// npm run db:types
//
// Tipos de base de datos para Montana OS CRM
// Generado basado en el schema definido en supabase/migrations/

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: 'admin' | 'asesor' | 'coordinador';
          nombre: string;
          email: string | null;
          telefono: string | null;
          whatsapp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'admin' | 'asesor' | 'coordinador';
          nombre: string;
          email?: string | null;
          telefono?: string | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'admin' | 'asesor' | 'coordinador';
          nombre?: string;
          email?: string | null;
          telefono?: string | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          nombre: string;
          email: string | null;
          telefono: string | null;
          whatsapp: string | null;
          ubicacion_actual: string | null;
          tipo_propiedad: string | null;
          presupuesto_min: number | null;
          presupuesto_max: number | null;
          zona: string | null;
          recamaras: number | null;
          banos: number | null;
          timeline: string | null;
          financiamiento: string | null;
          etapa: 'Nuevo' | 'Primer Contacto' | 'Calificado' | 'Presentación Programada' | 'Viendo Propiedad' | 'Negociación' | 'Cierre';
          asesor_id: string;
          temperatura: 'Frio' | 'Warm' | 'Caliente';
          fuente_lead: 'manual' | 'web_form' | 'csv_import';
          proxima_accion: string | null;
          fecha_proxima_accion: string | null;
          ultima_interaccion: string | null;
          tipo_ultima_interaccion: string | null;
          needs_escalation: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          email?: string | null;
          telefono?: string | null;
          whatsapp?: string | null;
          ubicacion_actual?: string | null;
          tipo_propiedad?: string | null;
          presupuesto_min?: number | null;
          presupuesto_max?: number | null;
          zona?: string | null;
          recamaras?: number | null;
          banos?: number | null;
          timeline?: string | null;
          financiamiento?: string | null;
          etapa?: 'Nuevo' | 'Primer Contacto' | 'Calificado' | 'Presentación Programada' | 'Viendo Propiedad' | 'Negociación' | 'Cierre';
          asesor_id: string;
          temperatura?: 'Frio' | 'Warm' | 'Caliente';
          fuente_lead: 'manual' | 'web_form' | 'csv_import';
          proxima_accion?: string | null;
          fecha_proxima_accion?: string | null;
          ultima_interaccion?: string | null;
          tipo_ultima_interaccion?: string | null;
          needs_escalation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string | null;
          telefono?: string | null;
          whatsapp?: string | null;
          ubicacion_actual?: string | null;
          tipo_propiedad?: string | null;
          presupuesto_min?: number | null;
          presupuesto_max?: number | null;
          zona?: string | null;
          recamaras?: number | null;
          banos?: number | null;
          timeline?: string | null;
          financiamiento?: string | null;
          etapa?: 'Nuevo' | 'Primer Contacto' | 'Calificado' | 'Presentación Programada' | 'Viendo Propiedad' | 'Negociación' | 'Cierre';
          asesor_id?: string;
          temperatura?: 'Frio' | 'Warm' | 'Caliente';
          fuente_lead?: 'manual' | 'web_form' | 'csv_import';
          proxima_accion?: string | null;
          fecha_proxima_accion?: string | null;
          ultima_interaccion?: string | null;
          tipo_ultima_interaccion?: string | null;
          needs_escalation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          lead_id: string | null;
          assigned_to: string;
          title: string;
          description: string | null;
          type: 'contact' | 'follow_up' | 'escalation' | 'reminder';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          status: 'pending' | 'completed' | 'cancelled';
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          assigned_to: string;
          title: string;
          description?: string | null;
          type: 'contact' | 'follow_up' | 'escalation' | 'reminder';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          status?: 'pending' | 'completed' | 'cancelled';
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          assigned_to?: string;
          title?: string;
          description?: string | null;
          type?: 'contact' | 'follow_up' | 'escalation' | 'reminder';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          status?: 'pending' | 'completed' | 'cancelled';
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          lead_id: string;
          sender: string;
          channel: 'call' | 'email' | 'whatsapp' | 'sms';
          content: string;
          duration_seconds: number | null;
          whatsapp_message_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          sender: string;
          channel: 'call' | 'email' | 'whatsapp' | 'sms';
          content: string;
          duration_seconds?: number | null;
          whatsapp_message_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          sender?: string;
          channel?: 'call' | 'email' | 'whatsapp' | 'sms';
          content?: string;
          duration_seconds?: number | null;
          whatsapp_message_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          lead_id: string;
          monto: number;
          condiciones: string | null;
          status: 'pending' | 'accepted' | 'rejected' | 'counter';
          fecha_respuesta_esperada: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          monto: number;
          condiciones?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'counter';
          fecha_respuesta_esperada?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          monto?: number;
          condiciones?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'counter';
          fecha_respuesta_esperada?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      update_updated_at_column: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      user_role: 'admin' | 'asesor' | 'coordinador';
      lead_etapa: 'Nuevo' | 'Primer Contacto' | 'Calificado' | 'Presentación Programada' | 'Viendo Propiedad' | 'Negociación' | 'Cierre';
      lead_fuente: 'manual' | 'web_form' | 'csv_import';
      message_channel: 'call' | 'email' | 'whatsapp' | 'sms';
      task_type: 'contact' | 'follow_up' | 'escalation' | 'reminder';
      task_priority: 'low' | 'normal' | 'high' | 'urgent';
      task_status: 'pending' | 'completed' | 'cancelled';
      offer_status: 'pending' | 'accepted' | 'rejected' | 'counter';
    };
  };
};
