import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/shared/sidebar';
import { Topbar } from '@/components/shared/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch user role from database
  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const profile = {
    id: user.id,
    email: user.email || 'usuario@montana.com',
    role: (userRole?.role || 'asesor') as const,
    name: user.user_metadata?.full_name || 'Usuario Test',
    avatar_url: null,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar profile={profile} />
      <div className="flex flex-1">
        <Sidebar role={profile.role as 'admin' | 'asesor' | 'coordinador'} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
