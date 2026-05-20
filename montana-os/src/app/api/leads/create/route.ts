import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LeadCreationSchema, BudgetValidationSchema } from '@/lib/validation';
import { z } from 'zod';

/**
 * POST /api/leads/create
 *
 * Create a new lead with validation, duplicate detection, and auto-assignment
 *
 * Request body:
 * {
 *   "nombre": "Juan García",
 *   "email": "juan@example.com",
 *   "telefono": "1234567890",
 *   "tipo_propiedad": "Casa",
 *   "zona": "Centro",
 *   "fuente": "web_form"
 * }
 *
 * Response (201):
 * {
 *   "id": "uuid",
 *   "nombre": "Juan García",
 *   ...
 * }
 *
 * Response (409): Duplicate lead
 * {
 *   "error": "Lead already exists",
 *   "existingLeadId": "uuid"
 * }
 *
 * Response (400): Validation error
 * {
 *   "error": "Validation error",
 *   "details": [...]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with LeadCreationSchema
    const validatedLead = LeadCreationSchema.parse(body);

    // Validate budget constraints
    BudgetValidationSchema.parse({
      presupuesto_min: validatedLead.presupuesto_min,
      presupuesto_max: validatedLead.presupuesto_max,
    });

    // Create Supabase client
    const supabase = await createClient();

    // Get current user session (optional for public lead creation)
    const { data: { user } } = await supabase.auth.getUser();

    // Check for duplicate leads by email or phone
    const duplicateChecks = [];

    if (validatedLead.email) {
      duplicateChecks.push(
        supabase
          .from('leads')
          .select('id')
          .eq('email', validatedLead.email)
          .single()
      );
    }

    if (validatedLead.telefono) {
      duplicateChecks.push(
        supabase
          .from('leads')
          .select('id')
          .eq('telefono', validatedLead.telefono)
          .single()
      );
    }

    // Execute duplicate checks in parallel
    if (duplicateChecks.length > 0) {
      const duplicateResults = await Promise.all(duplicateChecks);

      for (const result of duplicateResults) {
        if (result.data && !result.error) {
          return NextResponse.json(
            {
              error: 'Lead already exists',
              existingLeadId: result.data.id,
            },
            { status: 409, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Get available asesores and assign to one with fewest leads (round-robin)
    const { data: asesores, error: asesorError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'asesor');

    if (asesorError || !asesores || asesores.length === 0) {
      console.error('Error fetching asesores:', asesorError);
      return NextResponse.json(
        { error: 'No available asesor for assignment' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find asesor with fewest leads
    const asesorWithCounts = await Promise.all(
      asesores.map(async (asesor) => {
        const { count, error: countError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('asesor_id', asesor.id);

        return {
          id: asesor.id,
          leadCount: countError ? 0 : (count || 0),
        };
      })
    );

    const assignedAsesor = asesorWithCounts.reduce((prev, current) =>
      prev.leadCount <= current.leadCount ? prev : current
    );

    const asesorId = assignedAsesor.id;

    // Insert new lead
    const { data: newLeads, error: insertError } = await supabase
      .from('leads')
      .insert({
        nombre: validatedLead.nombre,
        email: validatedLead.email || null,
        telefono: validatedLead.telefono || null,
        whatsapp: validatedLead.whatsapp || null,
        ubicacion_actual: validatedLead.ubicacion_actual || null,
        tipo_propiedad: validatedLead.tipo_propiedad,
        presupuesto_min: validatedLead.presupuesto_min || null,
        presupuesto_max: validatedLead.presupuesto_max || null,
        zona: validatedLead.zona || null,
        recamaras: validatedLead.recamaras || null,
        banos: validatedLead.banos || null,
        timeline: validatedLead.timeline || null,
        financiamiento: validatedLead.financiamiento || null,
        etapa: 'Nuevo',
        temperatura: 'Warm',
        asesor_id: asesorId,
        fuente_lead: validatedLead.fuente,
      })
      .select();

    if (insertError || !newLeads || newLeads.length === 0) {
      console.error('Error creating lead:', insertError);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const createdLead = newLeads[0];

    // Create initial task for the assigned asesor
    const { error: taskError } = await supabase.from('tasks').insert({
      lead_id: createdLead.id,
      assigned_to: asesorId,
      title: `Contactar a ${createdLead.nombre}`,
      description: `Nuevo lead: ${createdLead.nombre}. Interesado en ${createdLead.tipo_propiedad}${createdLead.zona ? ` en ${createdLead.zona}` : ''}. Presupuesto: ${
        createdLead.presupuesto_min && createdLead.presupuesto_max
          ? `$${createdLead.presupuesto_min.toLocaleString()} - $${createdLead.presupuesto_max.toLocaleString()}`
          : 'Por definir'
      }`,
      type: 'contact',
      priority: 'high',
      status: 'pending',
      due_date: new Date().toISOString(),
      created_by: user?.id || null,
    });

    if (taskError) {
      console.warn('Warning: Could not create initial task:', taskError);
      // Don't fail the lead creation if task creation fails
    }

    return NextResponse.json(createdLead, {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
