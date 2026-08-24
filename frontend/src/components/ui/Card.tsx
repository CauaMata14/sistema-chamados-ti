import { cn } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-lg border border-ink-100 bg-white p-5 shadow-card', className)}>
      {children}
    </div>
  );
}
