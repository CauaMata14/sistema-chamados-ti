'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { CarregandoTela, EstadoErro, EstadoVazio } from '@/components/ui/States';
import { STATUS_LABEL } from '@/lib/constants';
import type { MetricasDashboard } from '@/types';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const dados = await api.get<MetricasDashboard>('/dashboard/metrics');
      setMetricas(dados);
    } catch (erroCapturado) {
      setErro(erroCapturado instanceof ApiError ? erroCapturado.message : 'Não foi possível carregar as métricas.');
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (usuario?.papel !== 'tecnico') {
    return <EstadoErro mensagem="O dashboard é exclusivo para técnicos." />;
  }

  if (erro) return <EstadoErro mensagem={erro} tentarNovamente={carregar} />;
  if (!metricas) return <CarregandoTela mensagem="Carregando métricas..." />;

  if (metricas.totalChamados === 0) {
    return (
      <EstadoVazio
        titulo="Ainda não há chamados"
        descricao="Assim que os primeiros chamados forem abertos, as métricas aparecerão aqui."
      />
    );
  }

  const totalAberto = metricas.porStatus.find((item) => item.status === 'aberto')?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl">Dashboard</h1>
        <p className="text-sm text-ink-400">Visão geral dos chamados de suporte.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard titulo="Total de chamados" valor={String(metricas.totalChamados)} />
        <MetricCard
          titulo="Aguardando atendimento"
          valor={String(totalAberto)}
          descricao={STATUS_LABEL.aberto}
        />
        <MetricCard
          titulo="Tempo médio de resolução"
          valor={metricas.tempoMedioResolucaoHoras !== null ? `${metricas.tempoMedioResolucaoHoras}h` : '—'}
          descricao={metricas.tempoMedioResolucaoHoras === null ? 'Nenhum chamado resolvido ainda' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusChart dados={metricas.porStatus} />
        <CategoryChart dados={metricas.porCategoria} />
      </div>
    </div>
  );
}
