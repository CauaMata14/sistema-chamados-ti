'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Usuario } from '@/types';

interface ItemNav {
  href: string;
  label: string;
  somenteTecnico?: boolean;
}

const ITENS: ItemNav[] = [
  { href: '/tickets', label: 'Chamados' },
  { href: '/dashboard', label: 'Dashboard', somenteTecnico: true },
  { href: '/categories', label: 'Categorias', somenteTecnico: true },
];

export function Sidebar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-ink-800 bg-ink-950 px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <p className="font-display text-base font-semibold text-white">Central de Chamados</p>
        <p className="mt-0.5 text-xs text-ink-400">Suporte de TI</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {ITENS.filter((item) => !item.somenteTecnico || usuario.papel === 'tecnico').map((item) => {
          const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'focus-ring rounded-md px-3 py-2 text-sm font-medium transition-colors',
                ativo ? 'bg-signal-800/40 text-white' : 'text-ink-300 hover:bg-ink-900 hover:text-white',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
