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

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return (
    <div className="min-h-screen flex">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col">
        <Topbar profile={profile} />
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
