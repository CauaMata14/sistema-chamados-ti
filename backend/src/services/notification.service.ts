import type { StatusChamado } from '../models/Ticket';
import { enviarEmail } from './email.service';

const LABEL_STATUS: Record<StatusChamado, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

interface NotificarMudancaStatusInput {
  destinatarioEmail: string;
  destinatarioNome: string;
  ticketId: string;
  ticketTitulo: string;
  statusAnterior: StatusChamado;
  statusNovo: StatusChamado;
}

/**
 * Notifica o solicitante por e-mail quando o status do chamado dele muda.
 * Chamada sem `await` pelos callers (fire-and-forget): a mudança de status
 * já foi persistida antes de notificar, e o envio em si é best-effort
 * (ver email.service) — não deve segurar a resposta da API esperando o
 * SMTP responder.
 */
export async function notificarMudancaStatus(input: NotificarMudancaStatusInput): Promise<void> {
  const { destinatarioEmail, destinatarioNome, ticketId, ticketTitulo, statusAnterior, statusNovo } = input;

  await enviarEmail({
    para: destinatarioEmail,
    assunto: `Chamado "${ticketTitulo}" — status atualizado para ${LABEL_STATUS[statusNovo]}`,
    html: `
      <p>Olá, ${destinatarioNome}.</p>
      <p>O status do seu chamado <strong>${ticketTitulo}</strong> foi atualizado:</p>
      <p style="font-size: 16px;">${LABEL_STATUS[statusAnterior]} &rarr; <strong>${LABEL_STATUS[statusNovo]}</strong></p>
      <p style="color: #666; font-size: 13px;">Chamado #${ticketId}</p>
    `,
  });
}
