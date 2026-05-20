'use client';

import { MontanaCard } from '@/components/cards/MontanaCard';
import { TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';

export default function ReportesPage() {
  const stats = [
    { label: 'Ventas Este Mes', value: '$245,000', icon: DollarSign, color: 'text-emerald-600', change: '+12%' },
    { label: 'Leads Totales', value: '128', icon: Users, color: 'text-blue-600', change: '+8%' },
    { label: 'Transacciones', value: '4', icon: CheckCircle, color: 'text-amber-600', change: '+2' },
    { label: 'Tasa Conversión', value: '3.1%', icon: TrendingUp, color: 'text-purple-600', change: '+0.5%' },
  ];

  const chartData = [
    { month: 'Enero', sales: 45000, leads: 28, conversions: 1 },
    { month: 'Febrero', sales: 52000, leads: 35, conversions: 1 },
    { month: 'Marzo', sales: 48000, leads: 32, conversions: 1 },
    { month: 'Abril', sales: 61000, leads: 42, conversions: 2 },
    { month: 'Mayo', sales: 71000, leads: 51, conversions: 2 },
  ];

  const maxSales = Math.max(...chartData.map((d) => d.sales));
  const maxLeads = Math.max(...chartData.map((d) => d.leads));

  const topProperties = [
    { name: 'Casa Garza García', sales: '$2.5M', views: 342, inquiries: 18 },
    { name: 'Penthouse Santa Catarina', sales: '$3.1M', views: 298, inquiries: 15 },
    { name: 'Villa San Pedro', sales: '$4.8M', views: 256, inquiries: 12 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="text-gray-600 mt-2">Visualiza tu desempeño y métricas clave</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <MontanaCard key={i}>
              <MontanaCard.Content>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <Icon size={20} className={stat.color} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-emerald-600 mt-2 font-semibold">{stat.change} vs mes anterior</p>
              </MontanaCard.Content>
            </MontanaCard>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <MontanaCard>
          <MontanaCard.Content>
            <h3 className="font-bold text-gray-900 mb-4">Ventas por Mes</h3>
            <div className="flex items-end justify-around h-48 gap-2">
              {chartData.map((data, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg transition hover:opacity-75"
                    style={{ height: `${(data.sales / maxSales) * 100}%` }}
                  />
                  <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                  <p className="text-xs font-bold text-gray-900">${(data.sales / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </MontanaCard.Content>
        </MontanaCard>

        {/* Leads Chart */}
        <MontanaCard>
          <MontanaCard.Content>
            <h3 className="font-bold text-gray-900 mb-4">Leads Generados</h3>
            <div className="flex items-end justify-around h-48 gap-2">
              {chartData.map((data, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition hover:opacity-75"
                    style={{ height: `${(data.leads / maxLeads) * 100}%` }}
                  />
                  <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                  <p className="text-xs font-bold text-gray-900">{data.leads}</p>
                </div>
              ))}
            </div>
          </MontanaCard.Content>
        </MontanaCard>
      </div>

      {/* Top Properties */}
      <MontanaCard>
        <MontanaCard.Content>
          <h3 className="font-bold text-gray-900 mb-4">Propiedades Top</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-900">Propiedad</th>
                  <th className="text-left py-3 font-semibold text-gray-900">Precio</th>
                  <th className="text-left py-3 font-semibold text-gray-900">Vistas</th>
                  <th className="text-left py-3 font-semibold text-gray-900">Consultas</th>
                </tr>
              </thead>
              <tbody>
                {topProperties.map((prop, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{prop.name}</td>
                    <td className="py-3 font-bold text-emerald-600">{prop.sales}</td>
                    <td className="py-3 text-gray-700">{prop.views}</td>
                    <td className="py-3 text-gray-700">{prop.inquiries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MontanaCard.Content>
      </MontanaCard>
    </div>
  );
}
