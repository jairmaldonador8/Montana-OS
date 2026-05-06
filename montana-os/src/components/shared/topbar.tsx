'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { ROLES } from '@/lib/constants';

interface TopbarProps {
  profile: {
    name: string;
    email: string;
    role: keyof typeof ROLES;
    avatar_url: string | null;
  };
}

export function Topbar({ profile }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="lg:hidden">
        <p className="text-[10px] uppercase tracking-[0.3em] text-montana-gold">
          Montana
        </p>
        <h1 className="text-lg font-editorial">OS</h1>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-secondary rounded-md transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{ROLES[profile.role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
