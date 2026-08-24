'use client';

import { PRIORIDADE_LABEL, STATUS_LABEL } from '@/lib/constants';
import type { Categoria, Prioridade, StatusChamado } from '@/types';

export interface FiltrosTickets {
  status: StatusChamado | '';
  categoria: string;
  prioridade: Prioridade | '';
}

interface TicketFiltersProps {
  categorias: Categoria[];
  filtros: FiltrosTickets;
  aoMudar: (filtros: FiltrosTickets) => void;
}

const selectClass =
  'focus-ring rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700';

export function TicketFilters({ categorias, filtros, aoMudar }: TicketFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Filtrar por status"
        className={selectClass}
        value={filtros.status}
        onChange={(evento) => aoMudar({ ...filtros, status: evento.target.value as StatusChamado | '' })}
      >
        <option value="">Todos os status</option>
        {Object.entries(STATUS_LABEL).map(([valor, label]) => (
          <option key={valor} value={valor}>
            {label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar por categoria"
        className={selectClass}
        value={filtros.categoria}
        onChange={(evento) => aoMudar({ ...filtros, categoria: evento.target.value })}
      >
        <option value="">Todas as categorias</option>
        {categorias.map((categoria) => (
          <option key={categoria._id} value={categoria._id}>
            {categoria.nome}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar por prioridade"
        className={selectClass}
        value={filtros.prioridade}
        onChange={(evento) => aoMudar({ ...filtros, prioridade: evento.target.value as Prioridade | '' })}
      >
        <option value="">Todas as prioridades</option>
        {Object.entries(PRIORIDADE_LABEL).map(([valor, label]) => (
          <option key={valor} value={valor}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
