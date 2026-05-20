'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/constants';
import {
  Home,
  Building2,
  ClipboardCheck,
  MessageSquare,
  Trello,
  DollarSign,
  Settings,
  Users,
  BarChart3,
} from 'lucide-react';

const navByRole: Record<Role, Array<{ href: string; label: string; icon: any }>> = {
  agent: [
    { href: '/propiedades', label: 'Mis propiedades', icon: Building2 },
    { href: '/propiedades/nueva', label: 'Nueva propiedad', icon: Home },
    { href: '/leads', label: 'Mis leads', icon: MessageSquare },
    { href: '/pipeline', label: 'Mi pipeline', icon: Trello },
    { href: '/comisiones', label: 'Mis comisiones', icon: DollarSign },
  ],
  publisher: [
    { href: '/revision', label: 'Cola de revisión', icon: ClipboardCheck },
    { href: '/propiedades', label: 'Propiedades publicadas', icon: Building2 },
    { href: '/leads', label: 'Inbox', icon: MessageSquare },
  ],
  broker: [
    { href: '/propiedades', label: 'Propiedades', icon: Building2 },
    { href: '/revision', label: 'Cola de revisión', icon: ClipboardCheck },
    { href: '/leads', label: 'Leads', icon: MessageSquare },
    { href: '/pipeline', label: 'Pipeline', icon: Trello },
    { href: '/comisiones', label: 'Comisiones', icon: DollarSign },
  ],
  admin: [
    { href: '/propiedades', label: 'Propiedades', icon: Building2 },
    { href: '/revision', label: 'Cola de revisión', icon: ClipboardCheck },
    { href: '/leads', label: 'Leads', icon: MessageSquare },
    { href: '/pipeline', label: 'Pipeline', icon: Trello },
    { href: '/comisiones', label: 'Comisiones', icon: DollarSign },
    { href: '/equipo', label: 'Equipo', icon: Users },
    { href: '/metricas', label: 'Métricas', icon: BarChart3 },
    { href: '/ajustes', label: 'Ajustes', icon: Settings },
  ],
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navByRole[role] ?? [];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
      <div className="p-6 border-b border-border">
        <p className="text-[10px] uppercase tracking-[0.3em] text-montana-gold">
          Montana
        </p>
        <h1 className="text-2xl font-editorial mt-1">OS</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
                          (item.href !== '/propiedades/nueva' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
