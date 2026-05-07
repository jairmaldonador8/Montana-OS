'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/propiedades');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
            Montana Realty Co.
          </p>
          <h1 className="text-5xl font-editorial font-light">Montana OS</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-montana-gold"
              placeholder="test@montanaos.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-montana-gold"
              placeholder="Tu contraseña"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-montana-gold text-montana-gold hover:bg-montana-gold hover:text-montana-black transition-colors text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            <strong>Demo:</strong> test@montanaos.com / Test123!@#
          </p>
        </div>
      </div>
    </main>
  );
}
