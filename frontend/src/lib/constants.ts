import type { Prioridade, StatusChamado } from '@/types';

export const STATUS_LABEL: Record<StatusChamado, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

export const STATUS_STYLE: Record<StatusChamado, string> = {
  aberto: 'bg-status-aberto-bg text-status-aberto',
  em_andamento: 'bg-status-andamento-bg text-status-andamento',
  resolvido: 'bg-status-resolvido-bg text-status-resolvido',
  fechado: 'bg-status-fechado-bg text-status-fechado',
};

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const PRIORIDADE_DOT: Record<Prioridade, string> = {
  baixa: 'bg-priority-baixa',
  media: 'bg-priority-media',
  alta: 'bg-priority-alta',
  critica: 'bg-priority-critica',
};

export const TRANSICOES_STATUS: Record<StatusChamado, StatusChamado[]> = {
  aberto: ['em_andamento'],
  em_andamento: ['resolvido', 'aberto'],
  resolvido: ['fechado', 'em_andamento'],
  fechado: [],
};
