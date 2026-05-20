'use client';

import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Home, Users, TrendingUp, DollarSign, Calendar, Map, MessageSquare, BarChart3 } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Propiedades', href: '/dashboard/propiedades', icon: Home },
  { label: 'Leads', href: '/dashboard/leads', icon: Users },
  { label: 'Pipeline', href: '/dashboard/pipeline', icon: TrendingUp },
  { label: 'Comisiones', href: '/dashboard/comisiones', icon: DollarSign },
  { label: 'Citas', href: '/dashboard/citas', icon: Calendar },
  { label: 'Mapas', href: '/dashboard/mapas', icon: Map },
  { label: 'Mensajes', href: '/dashboard/mensajes', icon: MessageSquare },
  { label: 'Reportes', href: '/dashboard/reportes', icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col p-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-amber-50 text-amber-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
