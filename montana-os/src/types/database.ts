// Este archivo se regenera automáticamente desde Supabase con:
// npm run db:types
//
// Por ahora es un placeholder. Después de hacer setup de Supabase, ejecuta:
// npx supabase login
// npm run db:types
//
// Esto reemplazará este archivo con los tipos reales de la DB.

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          avatar_url: string | null;
          role: 'admin' | 'broker' | 'publisher' | 'agent';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: any;
        Update: any;
      };
      // El resto se genera automáticamente
    };
  };
};
