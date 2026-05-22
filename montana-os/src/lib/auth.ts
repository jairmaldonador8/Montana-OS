import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return { ...user, profile };
}

export async function getUserRole(userId: string): Promise<'admin' | 'asesor' | 'coordinador' | null> {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single() as any;

  return (data?.role as 'admin' | 'asesor' | 'coordinador' | null) || null;
}
