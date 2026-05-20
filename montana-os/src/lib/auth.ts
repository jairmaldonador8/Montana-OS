import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return { ...user, profile };
}

export async function getUserRole(userId: string): Promise<'admin' | 'asesor' | 'coordinador' | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role as any || null;
}
