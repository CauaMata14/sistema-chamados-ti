import type { Metadata } from 'next';
import { Lexend, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const fontDisplay = Lexend({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const fontBody = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Central de Chamados de TI',
  description: 'Sistema de abertura e acompanhamento de chamados de suporte técnico.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
