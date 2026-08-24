export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-lg font-semibold text-white">Central de Chamados</p>
          <p className="mt-1 text-sm text-ink-400">Suporte técnico de TI</p>
        </div>
        <div className="rounded-lg border border-ink-800 bg-white p-8 shadow-popover">{children}</div>
      </div>
    </main>
  );
}
