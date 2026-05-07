import { createClient } from '@/lib/supabase/server';
import { FormProvider } from '@/context/formContext';
import { FormContainer } from '@/components/propiedades/FormContainer';
import { nanoid } from 'nanoid';

export default async function NuevaPropiedadPage() {
  // Initialize Supabase client
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is authenticated
  if (!user) {
    return <div>No autorizado</div>;
  }

  // Generate unique property ID
  const propertyId = nanoid();

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="space-y-8 max-w-3xl">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
            Captura
          </p>
          <h1 className="text-4xl font-editorial mt-2 text-white">Nueva propiedad</h1>
          <p className="text-gray-400 mt-2 font-editorial italic">
            Llena los datos · la asistente revisará y publicará.
          </p>
        </div>

        <FormProvider propertyId={propertyId}>
          <FormContainer propertyId={propertyId} />
        </FormProvider>
      </div>
    </div>
  );
}
