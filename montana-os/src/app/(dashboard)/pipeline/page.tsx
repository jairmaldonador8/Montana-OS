'use client';

import * as TabsRadix from '@radix-ui/react-tabs';
import { KanbanBoard } from '@/components/pipeline/kanban/KanbanBoard';
import { PipelineDashboard } from '@/components/pipeline/dashboard/PipelineDashboard';

export default function PipelinePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">Ventas</p>
        <h1 className="text-4xl font-editorial mt-2">Pipeline</h1>
      </div>

      <TabsRadix.Root defaultValue="kanban" className="w-full">
        <TabsRadix.List className="flex gap-2 border-b border-border">
          <TabsRadix.Trigger
            value="kanban"
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-montana-gold data-[state=active]:text-montana-gold transition-colors"
          >
            Kanban
          </TabsRadix.Trigger>
          <TabsRadix.Trigger
            value="table"
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-montana-gold data-[state=active]:text-montana-gold transition-colors"
          >
            Tabla
          </TabsRadix.Trigger>
          <TabsRadix.Trigger
            value="analytics"
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-montana-gold data-[state=active]:text-montana-gold transition-colors"
          >
            Analytics
          </TabsRadix.Trigger>
        </TabsRadix.List>

        <TabsRadix.Content value="kanban" className="mt-6">
          <KanbanBoard />
        </TabsRadix.Content>

        <TabsRadix.Content value="table" className="mt-6">
          <div className="border border-border rounded-md p-12 text-center">
            <p className="font-editorial text-2xl mb-3">Vista de Tabla</p>
            <p className="text-sm text-muted-foreground">Próximamente</p>
          </div>
        </TabsRadix.Content>

        <TabsRadix.Content value="analytics" className="mt-6">
          <PipelineDashboard />
        </TabsRadix.Content>
      </TabsRadix.Root>
    </div>
  );
}
