import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatarData(data: string | Date): string {
  return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatarDataRelativa(data: string | Date): string {
  return formatDistanceToNow(new Date(data), { locale: ptBR, addSuffix: true });
}
