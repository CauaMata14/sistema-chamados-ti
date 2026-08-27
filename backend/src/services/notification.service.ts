import type { StatusChamado } from '../models/Ticket';
import { enviarEmail } from './email.service';

const LABEL_STATUS: Record<StatusChamado, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

// Todo texto livre (comentário, nome, título) que entra no corpo HTML do
// e-mail passa por aqui primeiro — evita que alguém injete markup/script
// num cliente de e-mail alheio via um campo que o usuário controla.
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
      <p>Olá, ${escaparHtml(destinatarioNome)}.</p>
      <p>O status do seu chamado <strong>${escaparHtml(ticketTitulo)}</strong> foi atualizado:</p>
      <p style="font-size: 16px;">${LABEL_STATUS[statusAnterior]} &rarr; <strong>${LABEL_STATUS[statusNovo]}</strong></p>
      <p style="color: #666; font-size: 13px;">Chamado #${ticketId}</p>
    `,
  });
}

interface NotificarNovoComentarioInput {
  destinatarioEmail: string;
  destinatarioNome: string;
  ticketId: string;
  ticketTitulo: string;
  autorNome: string;
  textoComentario: string;
}

/**
 * Notifica o solicitante por e-mail quando um técnico comenta no chamado
 * dele. Só é chamada para comentários de quem não é o próprio solicitante
 * (ver `adicionarComentario` em ticket.service) — ninguém precisa ser
 * avisado por e-mail do próprio comentário.
 */
export async function notificarNovoComentario(input: NotificarNovoComentarioInput): Promise<void> {
  const { destinatarioEmail, destinatarioNome, ticketId, ticketTitulo, autorNome, textoComentario } = input;

  await enviarEmail({
    para: destinatarioEmail,
    assunto: `Novo comentário no chamado "${ticketTitulo}"`,
    html: `
      <p>Olá, ${escaparHtml(destinatarioNome)}.</p>
      <p><strong>${escaparHtml(autorNome)}</strong> comentou no seu chamado <strong>${escaparHtml(ticketTitulo)}</strong>:</p>
      <p style="white-space: pre-wrap; background: #f5f5f5; padding: 10px 14px; border-radius: 6px;">${escaparHtml(textoComentario)}</p>
      <p style="color: #666; font-size: 13px;">Chamado #${ticketId}</p>
    `,
  });
}
