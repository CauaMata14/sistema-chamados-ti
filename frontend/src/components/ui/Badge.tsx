import { cn } from '@/lib/utils';
import { PRIORIDADE_DOT, PRIORIDADE_LABEL, STATUS_LABEL, STATUS_STYLE } from '@/lib/constants';
import type { Prioridade, StatusChamado } from '@/types';

export function StatusBadge({ status }: { status: StatusChamado }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600">
      <span className={cn('h-1.5 w-1.5 rounded-full', PRIORIDADE_DOT[prioridade])} />
      {PRIORIDADE_LABEL[prioridade]}
    </span>
  );
}
