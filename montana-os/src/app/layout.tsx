import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

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

export const metadata: Metadata = {
  title: 'Montana OS',
  description: 'Sistema operativo de Montana Realty Co.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn("dark", inter.variable, cormorant.variable, "font-sans", poppins.variable)}>
      <body>{children}</body>
    </html>
  );
}
