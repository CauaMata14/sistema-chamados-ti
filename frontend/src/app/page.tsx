'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CarregandoTela } from '@/components/ui/States';

export default function HomePage() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    router.replace(usuario ? '/tickets' : '/login');
  }, [carregando, usuario, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50">
      <CarregandoTela mensagem="Preparando sua sessão..." />
    </main>
  );
}
