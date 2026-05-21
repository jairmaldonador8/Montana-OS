'use client';

import { useState } from 'react';
// import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
// import { MontanaButton } from '@/components/buttons/MontanaButton';
// import { MontanaCard } from '@/components/cards/MontanaCard';

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

    // const supabase = createClient();
    // const { error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    setLoading(false);

    // if (error) {
    //   setError(error.message);
    // } else {
    //   router.push('/dashboard/propiedades');
    // }

    setError('Login temporarily disabled for deployment. Please check back soon.');
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Montana OS
          </h1>
          <p className="text-gray-600 font-medium">
            Sistema Operativo Inmobiliario
          </p>
        </div>

        {/* Login Card - Simplified */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-colors duration-200"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-colors duration-200"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-amber-400 text-gray-900 font-semibold rounded-full hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">
            <strong className="text-amber-900">Credenciales de Demo:</strong>
          </p>
          <p className="text-xs text-gray-700 font-mono">
            Email: <span className="text-amber-700">test@montanaos.com</span>
          </p>
          <p className="text-xs text-gray-700 font-mono">
            Contraseña: <span className="text-amber-700">Test123!@#</span>
          </p>
        </div>
      </div>
    </main>
  );
}
