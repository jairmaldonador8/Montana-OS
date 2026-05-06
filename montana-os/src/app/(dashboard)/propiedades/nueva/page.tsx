export default function NuevaPropiedadPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
          Captura
        </p>
        <h1 className="text-4xl font-editorial mt-2">Nueva propiedad</h1>
        <p className="text-muted-foreground mt-2 font-editorial italic">
          Llena los datos · la asistente revisará y publicará.
        </p>
      </div>

      <div className="border border-border rounded-md p-12 text-center">
        <p className="font-editorial text-2xl mb-3">Formulario en construcción</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Aquí va el formulario multi-step de captura de propiedad.
          Construir con Claude Code siguiendo el documento de MVP.
        </p>
      </div>
    </div>
  );
}
