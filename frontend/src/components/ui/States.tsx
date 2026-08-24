import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-signal-200 border-t-signal-600',
        className,
      )}
      role="status"
      aria-label="Carregando"
    />
  );
}

export function CarregandoTela({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-ink-400">
      <Spinner />
      <p className="text-sm">{mensagem}</p>
    </div>
  );
}

export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
      <h3 className="text-base font-semibold text-ink-800">{titulo}</h3>
      <p className="max-w-sm text-sm text-ink-400">{descricao}</p>
      {acao}
    </div>
  );
}

export function EstadoErro({ mensagem, tentarNovamente }: { mensagem: string; tentarNovamente?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-red-800">Algo deu errado</h3>
      <p className="max-w-sm text-sm text-red-600">{mensagem}</p>
      {tentarNovamente && (
        <button
          onClick={tentarNovamente}
          className="focus-ring rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
