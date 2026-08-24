'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CarregandoTela } from '@/components/ui/States';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !usuario) {
      router.replace('/login');
    }
  }, [carregando, usuario, router]);

  if (carregando || !usuario) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-50">
        <CarregandoTela />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar usuario={usuario} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
