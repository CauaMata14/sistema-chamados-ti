'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { CarregandoTela, EstadoErro } from '@/components/ui/States';
import { TicketTimeline } from '@/components/tickets/TicketTimeline';
import { CommentForm } from '@/components/tickets/CommentForm';
import { TicketActions } from '@/components/tickets/TicketActions';
import { formatarData } from '@/lib/utils';
import type { StatusChamado, Ticket, TicketEvent } from '@/types';

export default function DetalheChamadoPage() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [timeline, setTimeline] = useState<TicketEvent[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [{ ticket: ticketCarregado }, { timeline: timelineCarregada }] = await Promise.all([
        api.get<{ ticket: Ticket }>(`/tickets/${id}`),
        api.get<{ timeline: TicketEvent[] }>(`/tickets/${id}/timeline`),
      ]);
      setTicket(ticketCarregado);
      setTimeline(timelineCarregada);
    } catch (erroCapturado) {
      setErro(erroCapturado instanceof ApiError ? erroCapturado.message : 'Não foi possível carregar o chamado.');
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function enviarComentario(texto: string) {
    await api.post(`/tickets/${id}/comments`, { texto });
    await carregar();
  }

  async function mudarStatus(status: StatusChamado) {
    await api.patch(`/tickets/${id}/status`, { status });
    await carregar();
  }

  async function atribuirTecnico(tecnicoId: string) {
    await api.patch(`/tickets/${id}/assign`, { tecnicoId });
    await carregar();
  }

  if (erro) return <EstadoErro mensagem={erro} tentarNovamente={carregar} />;
  if (!ticket || !timeline || !usuario) return <CarregandoTela mensagem="Carregando chamado..." />;

  const categoriaNome = typeof ticket.categoria === 'string' ? ticket.categoria : ticket.categoria.nome;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl text-ink-900">{ticket.titulo}</h1>
              <p className="mt-1 text-xs text-ink-400">
                Aberto por {ticket.solicitante.nome} em {formatarData(ticket.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PriorityBadge prioridade={ticket.prioridade} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm text-ink-700">{ticket.descricao}</p>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-100 pt-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-ink-400">Categoria</dt>
              <dd className="text-ink-700">{categoriaNome}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-400">Técnico responsável</dt>
              <dd className="text-ink-700">{ticket.tecnicoResponsavel?.nome ?? 'Não atribuído'}</dd>
            </div>
            {ticket.resolvedAt && (
              <div>
                <dt className="text-xs text-ink-400">Resolvido em</dt>
                <dd className="text-ink-700">{formatarData(ticket.resolvedAt)}</dd>
              </div>
            )}
            {ticket.closedAt && (
              <div>
                <dt className="text-xs text-ink-400">Fechado em</dt>
                <dd className="text-ink-700">{formatarData(ticket.closedAt)}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-ink-800">Histórico</h2>
          <TicketTimeline eventos={timeline} />
          <div className="mt-6 border-t border-ink-100 pt-4">
            <CommentForm aoEnviar={enviarComentario} />
          </div>
        </Card>
      </div>

      {usuario.papel === 'tecnico' && (
        <div className="lg:col-span-1">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-ink-800">Ações</h2>
            <TicketActions ticket={ticket} aoMudarStatus={mudarStatus} aoAtribuir={atribuirTecnico} />
          </Card>
        </div>
      )}
    </div>
  );
}
