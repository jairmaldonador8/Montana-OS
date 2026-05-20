---
name: lead-ingestion-pipeline
description: Use when implementing multi-source lead capture (web form, manual entry, CSV upload) with validation, deduplication, and auto-assignment
---

# Lead Ingestion Pipeline

## Overview
Build a flexible lead intake system that accepts leads from 3+ sources, validates data, deduplicates, and auto-assigns to asesor. Each source has different data quality expectations.

## When to Use
- Creating form endpoints that insert leads
- Building CSV import functionality
- Implementing manual lead creation in dashboard
- Consolidating leads from multiple sources

## Core Patterns

### 1. Define Lead Validation Schema

```typescript
import { z } from 'zod';

const LeadSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email().optional(),
  telefono: z.string().regex(/^\d{10,}/, 'Teléfono inválido').optional(),
  whatsapp: z.string().optional(),
  presupuesto_min: z.number().positive().optional(),
  presupuesto_max: z.number().positive().optional(),
  tipo_propiedad: z.enum(['Casa', 'Departamento', 'Terreno', 'Comercial']),
  zona: z.string().optional(),
  timeline: z.enum(['Hoy', 'Este mes', 'Este año', 'Sin prisa']).optional(),
  fuente: z.enum(['manual', 'web_form', 'csv_import']),
});

type Lead = z.infer<typeof LeadSchema>;
```

### 2. Web Form Endpoint (Single Lead)

```typescript
// src/pages/api/leads/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { LeadSchema } from '@/lib/validation';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Validate input
    const lead = LeadSchema.parse(req.body);

    // Check for duplicates (by email or phone)
    const existing = await findDuplicateLead(lead);
    if (existing) {
      return res.status(409).json({ error: 'Lead already exists', leadId: existing.id });
    }

    // Auto-assign to asesor (round-robin)
    const asesor = await getAvailableAsesor();

    // Insert lead
    const { data, error } = await supabase.from('leads').insert({
      nombre: lead.nombre,
      email: lead.email,
      telefono: lead.telefono,
      // ... other fields
      asesor_id: asesor.id,
      etapa: 'Nuevo',
      fuente_lead: 'web_form',
      created_at: new Date(),
    });

    if (error) throw error;

    // Notify asesor
    await notifyAsesorNewLead(asesor.id, lead.nombre);

    res.status(201).json({ leadId: data[0]?.id });
  } catch (error) {
    console.error('Lead creation failed:', error);
    res.status(400).json({ error: 'Invalid lead data' });
  }
}

async function findDuplicateLead(lead: Lead) {
  const { data } = await supabase
    .from('leads')
    .select('id')
    .or(
      `email.eq.${lead.email},telefono.eq.${lead.telefono}`
    )
    .limit(1)
    .single();
  return data;
}

async function getAvailableAsesor() {
  // Simple round-robin: get asesor with fewest leads
  const { data } = await supabase
    .from('users')
    .select('id, (leads(count))')
    .eq('role', 'asesor')
    .order('count', { ascending: true })
    .limit(1)
    .single();
  return data;
}

async function notifyAsesorNewLead(asesorId: string, nombre: string) {
  // Queue a WhatsApp/email notification
  await supabase.from('notifications').insert({
    user_id: asesorId,
    message: `Nuevo lead: ${nombre}`,
    type: 'new_lead',
    read: false,
  });
}
```

### 3. CSV Import (Batch Upload)

```typescript
// src/pages/api/leads/import-csv.ts
import { parseCSVFile } from '@/lib/csv-parser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const file = req.files?.csv; // Use multer or similar
    const rows = await parseCSVFile(file);

    const results = { success: 0, failed: 0, duplicates: 0 };

    for (const row of rows) {
      try {
        // Validate each row
        const lead = LeadSchema.parse({ ...row, fuente: 'csv_import' });

        // Check for duplicates
        const existing = await findDuplicateLead(lead);
        if (existing) {
          results.duplicates++;
          continue;
        }

        // Insert
        const asesor = await getAvailableAsesor();
        await supabase.from('leads').insert({
          ...lead,
          asesor_id: asesor.id,
          etapa: 'Nuevo',
        });

        results.success++;
      } catch (error) {
        console.error(`Row failed:`, row, error);
        results.failed++;
      }
    }

    res.json(results);
  } catch (error) {
    res.status(400).json({ error: 'CSV import failed' });
  }
}
```

### 4. Dashboard Manual Entry (React Component)

```typescript
// src/components/leads/NewLeadForm.tsx
import { useState } from 'react';
import { LeadSchema } from '@/lib/validation';

export function NewLeadForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const lead = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      tipo_propiedad: formData.get('tipo_propiedad'),
      presupuesto_min: formData.get('presupuesto_min'),
      presupuesto_max: formData.get('presupuesto_max'),
      fuente: 'manual',
    };

    try {
      LeadSchema.parse(lead);

      const res = await fetch('/api/leads/create', {
        method: 'POST',
        body: JSON.stringify(lead),
      });

      if (res.ok) {
        alert('Lead creado exitosamente');
        e.currentTarget.reset();
      } else {
        const { error } = await res.json();
        alert(error || 'Error al crear lead');
      }
    } catch (error) {
      alert('Validación fallida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="nombre" placeholder="Nombre" required />
      <input type="email" name="email" placeholder="Email" />
      <input type="tel" name="telefono" placeholder="Teléfono" />
      <select name="tipo_propiedad" required>
        <option>Casa</option>
        <option>Departamento</option>
        <option>Terreno</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Lead'}
      </button>
    </form>
  );
}
```

## Common Mistakes

**Mistake 1:** No deduplication - same lead imported twice
- Problem: Leads from multiple sources overlap (web form + CSV both have same email)
- Fix: Always check for existing lead by email/phone before insert

**Mistake 2:** Validation only on frontend
- Problem: API accepts garbage data if frontend validation is bypassed
- Fix: Always validate on backend using Zod, Joi, or similar

**Mistake 3:** No error handling in batch import
- Problem: One bad row causes entire CSV import to fail
- Fix: Process row-by-row, track successes/failures separately, return detailed report

**Mistake 4:** Auto-assignment without checking lead volume
- Problem: New asesor gets overloaded immediately
- Fix: Use weighted assignment (leads per asesor, conversion rate, workload)

## Implementation Checklist

- [ ] Create LeadSchema with Zod validation
- [ ] Implement `/api/leads/create` endpoint
- [ ] Add duplicate detection (email/phone)
- [ ] Implement `getAvailableAsesor()` function
- [ ] Create CSV import endpoint with error handling
- [ ] Build React form component for manual entry
- [ ] Test deduplication (same lead twice = error)
- [ ] Test auto-assignment (leads distributed evenly)
- [ ] Set up notifications when new lead arrives
