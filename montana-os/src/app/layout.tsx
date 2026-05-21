'use client';

import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, Poppins } from 'next/font/google';
import './globals.css';
// import { cn } from "@/lib/utils";
// import { ThemeProvider } from '@/context/ThemeContext';
// import { SessionProvider } from '@supabase/auth-helpers-react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import type { Database } from '@/types/database';

const poppins = Poppins({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const supabase = createClientComponentClient<Database>();

  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable} font-sans ${poppins.variable}`}>
      <body>
        {/* <SessionProvider supabaseClient={supabase}>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider> */}
        {children}
      </body>
    </html>
  );
}
