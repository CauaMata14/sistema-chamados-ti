import { STATUS_LABEL } from '@/lib/constants';
import { formatarData } from '@/lib/utils';
import type { TicketEvent } from '@/types';

function descreverEvento(evento: TicketEvent): string {
  if (evento.tipo === 'mudanca_status' && evento.statusAnterior && evento.statusNovo) {
    return `alterou o status de "${STATUS_LABEL[evento.statusAnterior]}" para "${STATUS_LABEL[evento.statusNovo]}"`;
  }
  if (evento.tipo === 'atribuicao' && evento.tecnicoAtribuido) {
    return `atribuiu o chamado para ${evento.tecnicoAtribuido.nome}`;
  }
  return 'comentou';
}

export function TicketTimeline({ eventos }: { eventos: TicketEvent[] }) {
  if (eventos.length === 0) {
    return <p className="text-sm text-ink-400">Nenhuma atividade registrada ainda.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {eventos.map((evento) => (
        <li key={evento._id} className="flex gap-3 border-l-2 border-ink-100 pl-4">
          <div className="flex-1">
            <p className="text-sm text-ink-700">
              <span className="font-medium text-ink-900">{evento.autor.nome}</span>{' '}
              {descreverEvento(evento)}
            </p>
            {evento.tipo === 'comentario' && evento.texto && (
              <p className="mt-1 whitespace-pre-wrap rounded-md bg-ink-50 px-3 py-2 text-sm text-ink-700">
                {evento.texto}
              </p>
            )}
            <p className="mt-1 text-xs text-ink-400">{formatarData(evento.createdAt)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
