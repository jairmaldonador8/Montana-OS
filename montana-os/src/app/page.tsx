import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
          Montana Realty Co.
        </p>
        <h1 className="text-6xl md:text-8xl font-editorial font-light">
          Montana OS
        </h1>
        <p className="text-lg text-muted-foreground font-editorial italic">
          El sistema operativo de la inmobiliaria.
        </p>
        <div className="pt-8">
          <Link
            href="/login"
            className="inline-block px-8 py-3 border border-montana-gold text-montana-gold hover:bg-montana-gold hover:text-montana-black transition-colors text-sm uppercase tracking-widest"
          >
            Acceder
          </Link>
        </div>
      </div>
    </main>
  );
}
