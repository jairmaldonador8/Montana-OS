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

  const profile = {
    id: user.id,
    email: user.email || 'usuario@montana.com',
    role: 'admin' as const,
    name: user.user_metadata?.full_name || 'Usuario Test',
    avatar_url: null,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar profile={profile as any} />
      <div className="flex flex-1">
        <Sidebar role={profile.role as 'admin' | 'broker' | 'publisher' | 'agent'} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
