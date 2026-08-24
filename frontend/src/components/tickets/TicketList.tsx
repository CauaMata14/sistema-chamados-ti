'use client';

import Link from 'next/link';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { formatarDataRelativa } from '@/lib/utils';
import type { Ticket, Usuario } from '@/types';

export function TicketList({ tickets, usuario }: { tickets: Ticket[]; usuario: Usuario }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
          <tr>
            <th className="px-4 py-3 font-medium">Chamado</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Prioridade</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {usuario.papel === 'tecnico' && <th className="px-4 py-3 font-medium">Solicitante</th>}
            <th className="px-4 py-3 font-medium">Aberto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-50">
          {tickets.map((ticket) => (
            <tr key={ticket._id} className="transition-colors hover:bg-ink-50/60">
              <td className="px-4 py-3">
                <Link
                  href={`/tickets/${ticket._id}`}
                  className="focus-ring rounded font-medium text-ink-900 hover:text-signal-700"
                >
                  {ticket.titulo}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-500">
                {typeof ticket.categoria === 'string' ? ticket.categoria : ticket.categoria.nome}
              </td>
              <td className="px-4 py-3">
                <PriorityBadge prioridade={ticket.prioridade} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              {usuario.papel === 'tecnico' && (
                <td className="px-4 py-3 text-ink-500">{ticket.solicitante.nome}</td>
              )}
              <td className="px-4 py-3 text-ink-400">{formatarDataRelativa(ticket.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
