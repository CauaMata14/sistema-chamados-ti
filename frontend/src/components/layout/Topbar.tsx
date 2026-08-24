'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  const { usuario, sair } = useAuth();

  if (!usuario) return null;

  return (
    <header className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-3 md:px-8">
      <Link href="/tickets" className="font-display text-sm font-semibold text-ink-900 md:hidden">
        Central de Chamados
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-ink-800">{usuario.nome}</p>
          <p className="text-xs text-ink-400">{usuario.papel === 'tecnico' ? 'Técnico' : 'Usuário'}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void sair()}>
          Sair
        </Button>
      </div>
    </header>
  );
}
