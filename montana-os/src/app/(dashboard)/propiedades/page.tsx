import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function PropiedadesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
            Inventario
          </p>
          <h1 className="text-4xl font-editorial mt-2">Propiedades</h1>
        </div>
        <Link
          href="/propiedades/nueva"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-montana-gold text-montana-gold hover:bg-montana-gold hover:text-montana-black transition-colors text-sm uppercase tracking-widest"
        >
          <Plus className="h-4 w-4" />
          Nueva propiedad
        </Link>
      </div>

      <div className="border border-border rounded-md p-12 text-center">
        <p className="font-editorial text-2xl mb-3">Aún no hay propiedades</p>
        <p className="text-sm text-muted-foreground">
          Empieza añadiendo la primera propiedad de Montana al sistema.
        </p>
        <Link
          href="/propiedades/nueva"
          className="inline-block mt-6 px-5 py-2 text-sm text-montana-gold border border-montana-gold/50 hover:border-montana-gold transition-colors"
        >
          Añadir primera propiedad
        </Link>
      </div>
    </div>
  );
}
