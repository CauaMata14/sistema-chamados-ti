'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { STATUS_LABEL, TRANSICOES_STATUS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import type { StatusChamado, Ticket, UsuarioResumo } from '@/types';

interface TicketActionsProps {
  ticket: Ticket;
  aoMudarStatus: (status: StatusChamado) => Promise<void>;
  aoAtribuir: (tecnicoId: string) => Promise<void>;
}

export function TicketActions({ ticket, aoMudarStatus, aoAtribuir }: TicketActionsProps) {
  const [tecnicos, setTecnicos] = useState<UsuarioResumo[]>([]);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('');
  const [carregandoAcao, setCarregandoAcao] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ tecnicos: UsuarioResumo[] }>('/users/technicians')
      .then((resposta) => setTecnicos(resposta.tecnicos))
      .catch(() => undefined);
  }, []);

  const transicoesPossiveis = TRANSICOES_STATUS[ticket.status];

  async function executarMudancaStatus(status: StatusChamado) {
    setCarregandoAcao(status);
    try {
      await aoMudarStatus(status);
    } finally {
      setCarregandoAcao(null);
    }
  }

  async function executarAtribuicao() {
    if (!tecnicoSelecionado) return;
    setCarregandoAcao('atribuir');
    try {
      await aoAtribuir(tecnicoSelecionado);
      setTecnicoSelecionado('');
    } finally {
      setCarregandoAcao(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium text-ink-700">Atribuir técnico</p>
        <div className="flex gap-2">
          <select
            aria-label="Selecionar técnico"
            className="focus-ring flex-1 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm"
            value={tecnicoSelecionado}
            onChange={(evento) => setTecnicoSelecionado(evento.target.value)}
          >
            <option value="">
              {ticket.tecnicoResponsavel ? `Atual: ${ticket.tecnicoResponsavel.nome}` : 'Selecione um técnico'}
            </option>
            {tecnicos.map((tecnico) => (
              <option key={tecnico._id} value={tecnico._id}>
                {tecnico.nome}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="secondary"
            disabled={!tecnicoSelecionado}
            carregando={carregandoAcao === 'atribuir'}
            onClick={executarAtribuicao}
          >
            Atribuir
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-700">Mudar status</p>
        {transicoesPossiveis.length === 0 ? (
          <p className="text-sm text-ink-400">Este chamado está fechado e não aceita mais mudanças.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {transicoesPossiveis.map((status) => (
              <Button
                key={status}
                size="sm"
                variant="secondary"
                carregando={carregandoAcao === status}
                onClick={() => executarMudancaStatus(status)}
              >
                Marcar como {STATUS_LABEL[status].toLowerCase()}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
