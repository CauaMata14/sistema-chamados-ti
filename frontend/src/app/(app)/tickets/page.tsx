'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { CarregandoTela, EstadoErro, EstadoVazio } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { TicketFilters, type FiltrosTickets } from '@/components/tickets/TicketFilters';
import { TicketList } from '@/components/tickets/TicketList';
import type { Categoria, Paginacao, Ticket } from '@/types';

const FILTROS_INICIAIS: FiltrosTickets = { status: '', categoria: '', prioridade: '' };

export default function TicketsPage() {
  const { usuario } = useAuth();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [filtros, setFiltros] = useState<FiltrosTickets>(FILTROS_INICIAIS);
  const [pagina, setPagina] = useState(1);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const params = new URLSearchParams({ pagina: String(pagina), limite: '10' });
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.categoria) params.set('categoria', filtros.categoria);
      if (filtros.prioridade) params.set('prioridade', filtros.prioridade);

      const resultado = await api.get<{ itens: Ticket[]; paginacao: Paginacao }>(
        `/tickets?${params.toString()}`,
      );
      setTickets(resultado.itens);
      setPaginacao(resultado.paginacao);
    } catch (erroCapturado) {
      setErro(erroCapturado instanceof ApiError ? erroCapturado.message : 'Não foi possível carregar os chamados.');
    }
  }, [filtros, pagina]);

  useEffect(() => {
    api
      .get<{ categorias: Categoria[] }>('/categories')
      .then((resposta) => setCategorias(resposta.categorias))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (!usuario) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl">Chamados</h1>
          <p className="text-sm text-ink-400">
            {usuario.papel === 'tecnico' ? 'Todos os chamados abertos no sistema.' : 'Seus chamados de suporte.'}
          </p>
        </div>
        <Link href="/tickets/new">
          <Button>Novo chamado</Button>
        </Link>
      </div>

      <TicketFilters
        categorias={categorias}
        filtros={filtros}
        aoMudar={(novosFiltros) => {
          setFiltros(novosFiltros);
          setPagina(1);
        }}
      />

      {tickets === null && !erro && <CarregandoTela mensagem="Carregando chamados..." />}

      {erro && <EstadoErro mensagem={erro} tentarNovamente={carregar} />}

      {tickets !== null && !erro && tickets.length === 0 && (
        <EstadoVazio
          titulo="Nenhum chamado encontrado"
          descricao="Ajuste os filtros ou abra um novo chamado para começar."
          acao={
            <Link href="/tickets/new">
              <Button size="sm">Abrir chamado</Button>
            </Link>
          }
        />
      )}

      {tickets !== null && tickets.length > 0 && (
        <>
          <TicketList tickets={tickets} usuario={usuario} />
          {paginacao && <Pagination paginacao={paginacao} aoMudarPagina={setPagina} />}
        </>
      )}
    </div>
  );
}
