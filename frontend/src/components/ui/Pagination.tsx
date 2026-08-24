import { Button } from './Button';
import type { Paginacao } from '@/types';

export function Pagination({
  paginacao,
  aoMudarPagina,
}: {
  paginacao: Paginacao;
  aoMudarPagina: (pagina: number) => void;
}) {
  if (paginacao.totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm text-ink-500">
      <span>
        Página {paginacao.pagina} de {paginacao.totalPaginas} · {paginacao.total} chamado
        {paginacao.total === 1 ? '' : 's'}
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={paginacao.pagina <= 1}
          onClick={() => aoMudarPagina(paginacao.pagina - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={paginacao.pagina >= paginacao.totalPaginas}
          onClick={() => aoMudarPagina(paginacao.pagina + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
