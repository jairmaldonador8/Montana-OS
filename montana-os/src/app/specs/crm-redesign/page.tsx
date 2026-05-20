'use client';

import { MontanaCard } from '@/components/cards/MontanaCard';
import { CheckCircle, Users, Zap, Database } from 'lucide-react';

export default function CRMRedesignSpec() {
  const sections = [
    {
      title: 'Arquitectura de Roles',
      icon: Users,
      description: '3 dashboards especializados por rol',
      details: [
        'Admin/Manager: Visión completa de operación',
        'Asesor: Herramienta de cierre enfocada',
        'Coordinador: Soporte administrativo'
      ]
    },
    {
      title: 'Pipeline de 7 Etapas',
      icon: Zap,
      description: 'Automatizaciones inteligentes en cada punto',
      details: [
        'Nuevo → Primer Contacto → Calificado',
        'Presentación Programada → Viendo Propiedad',
        'Negociación → Cierre',
        'Escalamientos automáticos al manager'
      ]
    },
    {
      title: 'Fuentes de Leads',
      icon: Database,
      description: 'Múltiples canales de entrada',
      details: [
        'Leads manuales desde dashboard',
        'Formulario web (landing page)',
        'Importación en lote (CSV)',
        'Integraciones: WhatsApp, Google Calendar, Gmail'
      ]
    },
    {
      title: 'Reportes & Analytics',
      icon: CheckCircle,
      description: 'Datos accionables para cada rol',
      details: [
        'Manager: KPIs, desempeño del equipo, tendencias',
        'Asesor: Performance personal, pipeline',
        'Dashboards en tiempo real',
        'Proyecciones y forecasts'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Montana OS CRM Premium
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Especificación de Diseño - CRM Inmobiliario Profesional
          </p>
          <p className="text-sm text-gray-500">
            Basado en GoHighLevel • Role-based dashboards • Automatizaciones inteligentes
          </p>
        </div>

        {/* Goal & Architecture */}
        <MontanaCard className="mb-8">
          <MontanaCard.Content>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Objetivo & Arquitectura</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Goal</h3>
                <p className="text-gray-700">
                  Construir un CRM inmobiliario profesional y vendible que permita a asesores cerrar clientes,
                  gestionar leads, y dar seguimiento automatizado. Sistema basado en GoHighLevel con dashboards
                  role-based para Admin, Asesor y Coordinador.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Architecture</h3>
                <p className="text-gray-700 mb-3">
                  Sistema de 3 dashboards especializados según rol. Pipeline de 7 etapas con automatizaciones
                  inteligentes. Leads llegan de múltiples fuentes y se trabajan hasta cierre con recordatorios
                  y escalamientos automáticos.
                </p>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm font-mono text-amber-900">
                    Nuevo → Primer Contacto → Calificado → Presentación Programada<br/>
                    ↓<br/>
                    Viendo Propiedad → Negociación → Cierre ✓
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tech Stack</h3>
                <p className="text-gray-700">
                  Next.js 15 • React 19 • TypeScript • Tailwind CSS v4 • shadcn/ui • Supabase (PostgreSQL)
                  • Motion para animaciones
                </p>
              </div>
            </div>
          </MontanaCard.Content>
        </MontanaCard>

        {/* Core Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Características Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <MontanaCard key={idx}>
                  <MontanaCard.Content>
                    <div className="flex items-start gap-4">
                      <Icon className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{section.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                        <ul className="space-y-2">
                          {section.details.map((detail, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-amber-400 mt-1">✓</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </MontanaCard.Content>
                </MontanaCard>
              );
            })}
          </div>
        </div>

        {/* Dashboards */}
        <MontanaCard className="mb-8">
          <MontanaCard.Content>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 Los 3 Dashboards</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-amber-400 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">Dashboard 1: Admin/Manager</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Visión completa de la operación y gestión del equipo.
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Todos los leads filtrados (por asesor, etapa, fecha, presupuesto)</li>
                  <li>✓ Desempeño del equipo: conversión, ingresos, velocidad</li>
                  <li>✓ Alertas inteligentes: leads atrasados, oportunidades grandes sin mover</li>
                  <li>✓ Reportes avanzados: ingresos por período, tasa de conversión por etapa</li>
                  <li>✓ Configuración: gestionar asesores, automatizaciones, permisos</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">Dashboard 2: Asesor</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Herramienta de cierre 100% enfocada. Simple, clara, sin ruido.
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Mi trabajo HOY: tareas prioritarias, recordatorios automáticos</li>
                  <li>✓ Mi Pipeline (Kanban): arrastra leads entre etapas</li>
                  <li>✓ Perfil detallado del lead: historial completo, interacciones, documentos</li>
                  <li>✓ Acciones rápidas: registrar call/email, agendar seguimiento, compartir propiedad</li>
                  <li>✓ Mi performance: conversión, leads cerrados, ingresos</li>
                </ul>
              </div>

              <div className="border-l-4 border-emerald-400 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">Dashboard 3: Coordinador Admin (Opcional)</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Soporte operativo y gestión administrativa.
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Leads nuevos: revisar y asignar a asesores</li>
                  <li>✓ Coordinación: ver agenda de visitas, evitar conflictos</li>
                  <li>✓ Documentación: gestionar papelería, contratos, firmas</li>
                  <li>✓ Seguimiento: alertar sobre leads sin follow-up</li>
                </ul>
              </div>
            </div>
          </MontanaCard.Content>
        </MontanaCard>

        {/* Automatizaciones */}
        <MontanaCard className="mb-8">
          <MontanaCard.Content>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Automatizaciones por Etapa</h2>

            <div className="space-y-4">
              {[
                { etapa: 'NUEVO', accion: 'Lead entra al sistema', auto: 'Asigna a asesor, crea tarea, notifica por WhatsApp' },
                { etapa: 'PRIMER CONTACTO', accion: 'Asesor contacta (call/email/msg)', auto: 'Registra interacción, recordatorio 24h, escala si > 3 días sin respuesta' },
                { etapa: 'CALIFICADO', accion: 'Confirma viabilidad del lead', auto: 'Si presupuesto grande → notifica manager, sugiere propiedades' },
                { etapa: 'PRESENTACIÓN PROGRAMADA', accion: 'Cita agendada', auto: 'Sincroniza calendar, confirmación 24h antes, recordatorio 1h antes' },
                { etapa: 'VIENDO PROPIEDAD', accion: 'Visita realizada', auto: 'Registra reacción, sugiere siguientes pasos, escala si > 7 días sin mover' },
                { etapa: 'NEGOCIACIÓN', accion: 'Oferta hecha', auto: 'Tracking automático, recordatorios de deadline, escala si > 7 días' },
                { etapa: 'CIERRE', accion: 'Lead cerrado', auto: 'Genera reporte, registra comisión, actualiza analytics' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-400 text-gray-900 font-bold text-xs px-3 py-1 rounded whitespace-nowrap">
                      {item.etapa}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{item.accion}</p>
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-amber-600">Auto:</span> {item.auto}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MontanaCard.Content>
        </MontanaCard>

        {/* Data Structure */}
        <MontanaCard className="mb-8">
          <MontanaCard.Content>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Estructura de Datos (Campos por Lead)</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2 text-amber-600">CONTACTO</h3>
                <p className="text-xs text-gray-700">
                  Nombre • Teléfono • Email • WhatsApp • Ubicación actual
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2 text-blue-600">BÚSQUEDA INMOBILIARIA</h3>
                <p className="text-xs text-gray-700">
                  Tipo propiedad • Presupuesto • Zona • Recámaras/baños • Timeline • Financiamiento
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2 text-emerald-600">SEGUIMIENTO</h3>
                <p className="text-xs text-gray-700">
                  Etapa actual • Asesor asignado • Próxima acción • Última interacción • Temperatura
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2 text-purple-600">HISTORIAL (Automático)</h3>
                <p className="text-xs text-gray-700">
                  Todas las interacciones con timestamp • Notas privadas • Propiedades mostradas
                  • Feedback de cada propiedad • Documentos compartidos
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2 text-rose-600">NEGOCIACIÓN</h3>
                <p className="text-xs text-gray-700">
                  Monto ofertado • Status • Condiciones • Fecha respuesta esperada
                </p>
              </div>
            </div>
          </MontanaCard.Content>
        </MontanaCard>

        {/* Integraciones */}
        <MontanaCard className="mb-8">
          <MontanaCard.Content>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔗 Integraciones & Fuentes de Leads</h2>

            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="font-semibold text-gray-900 text-sm mb-2">Fuentes de Leads</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>✓ Leads manuales: Formulario en dashboard</li>
                  <li>✓ Leads web: Formulario en landing page</li>
                  <li>✓ Importación: CSV en lote</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-900 text-sm mb-2">Integraciones Externas</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>✓ WhatsApp API: Mensajes directos desde CRM</li>
                  <li>✓ Google Calendar: Sincronización de citas</li>
                  <li>✓ Gmail/Outlook: Sincronización de emails</li>
                  <li>✓ Zapier: Conectar con Facebook Ads, Google Forms, etc</li>
                </ul>
              </div>
            </div>
          </MontanaCard.Content>
        </MontanaCard>

        {/* Next Steps */}
        <MontanaCard>
          <MontanaCard.Content>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Siguientes Pasos</h2>
            <ol className="text-gray-700 space-y-2">
              <li><span className="font-semibold">1. Deep Research:</span> Verificar best practices actuales de CRMs y GoHighLevel</li>
              <li><span className="font-semibold">2. Skills Audit:</span> Verificar si tenemos las habilidades necesarias</li>
              <li><span className="font-semibold">3. Implementation Plan:</span> Plan detallado task-by-task</li>
              <li><span className="font-semibold">4. Execution:</span> Implementación con subagent-driven-development</li>
            </ol>
          </MontanaCard.Content>
        </MontanaCard>
      </div>
    </div>
  );
}
