'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
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

        {sent ? (
          <div className="text-center space-y-4 p-8 border border-border rounded-md">
            <p className="font-editorial text-2xl">Revisa tu correo</p>
            <p className="text-sm text-muted-foreground">
              Te enviamos un enlace mágico a <span className="text-foreground">{email}</span>.
              Da click ahí para entrar.
            </p>
          </div>
        ) : (
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
                placeholder="tu@montana-realty-co.com"
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
              {loading ? 'Enviando...' : 'Enviar enlace mágico'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
