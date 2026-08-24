import nodemailer, { type Transporter } from 'nodemailer';
import { env, emailHabilitado } from '../config/env';

let transporter: Transporter | null = null;
let avisoDesativadoJaExibido = false;

function obterTransporter(): Transporter | null {
  if (!emailHabilitado) {
    if (!avisoDesativadoJaExibido) {
      console.warn(
        '[email] SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASS) — notificações por e-mail desativadas.',
      );
      avisoDesativadoJaExibido = true;
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }

  return transporter;
}

interface EnviarEmailInput {
  para: string;
  assunto: string;
  html: string;
}

/**
 * Envia um e-mail de forma best-effort: nunca lança. Notificação é um
 * efeito colateral de uma operação de negócio já concluída (ex: mudança
 * de status já persistida) — uma falha de SMTP não pode derrubar a
 * requisição nem virar um 500 para quem só estava atualizando um chamado.
 */
export async function enviarEmail({ para, assunto, html }: EnviarEmailInput): Promise<void> {
  const client = obterTransporter();
  if (!client) return;

  try {
    await client.sendMail({
      from: env.SMTP_FROM ?? env.SMTP_USER,
      to: para,
      subject: assunto,
      html,
    });
  } catch (erro) {
    console.error('[email] Falha ao enviar e-mail:', erro);
  }
}
