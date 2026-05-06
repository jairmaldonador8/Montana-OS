import { NextResponse } from 'next/server';
import { anthropic, DEFAULT_MODEL } from '@/lib/anthropic/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  // Verificar autenticación
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const { bullets, type, neighborhood, m2_built, bedrooms, bathrooms, amenities } = body;

  if (!bullets) {
    return NextResponse.json({ error: 'bullets requeridos' }, { status: 400 });
  }

  const systemPrompt = `Eres el redactor editorial de Montana Realty Co., una agencia inmobiliaria boutique de lujo en San Pedro Garza García, Nuevo León, México.

Tu voz editorial:
- Sobria, elegante, no cursi
- Frases cortas con cadencia
- Cero exceso de adjetivos
- Cero emojis
- Cero exclamaciones
- Cero clichés inmobiliarios ("tu hogar soñado", "oportunidad única", etc.)
- Tono inspirado en revistas como AD, Architectural Digest, Wallpaper
- Énfasis en arquitectura, materialidad, contexto y vida cotidiana — no en el precio o "amenidades"

Estructura de la descripción:
1. Apertura de 1-2 frases que evocan el carácter de la propiedad
2. Párrafo descriptivo de la arquitectura y los espacios principales
3. Párrafo sobre amenidades y exteriores
4. Cierre breve sobre la ubicación y el estilo de vida

Largo: 150-220 palabras.`;

  const userPrompt = `Genera la descripción para esta propiedad:

Tipo: ${type ?? 'no especificado'}
Colonia: ${neighborhood ?? 'no especificada'}
Construcción: ${m2_built ? `${m2_built} m²` : 'no especificada'}
Recámaras: ${bedrooms ?? 'no especificadas'}
Baños: ${bathrooms ?? 'no especificados'}
Amenidades: ${amenities?.join(', ') ?? 'no especificadas'}

Notas del asesor:
${bullets}`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as { type: 'text'; text: string }).text)
      .join('\n');

    return NextResponse.json({ description: text });
  } catch (error) {
    console.error('Error generando descripción:', error);
    return NextResponse.json({ error: 'failed to generate' }, { status: 500 });
  }
}
