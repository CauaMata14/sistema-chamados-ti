import { Card } from '@/components/ui/Card';

export function MetricCard({
  titulo,
  valor,
  descricao,
}: {
  titulo: string;
  valor: string;
  descricao?: string;
}) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{titulo}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink-950">{valor}</p>
      {descricao && <p className="mt-1 text-xs text-ink-400">{descricao}</p>}
    </Card>
  );
}
