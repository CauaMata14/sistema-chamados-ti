import { FilterQuery } from 'mongoose';
import { Ticket, TRANSICOES_STATUS, type TicketDocument, type StatusChamado } from '../models/Ticket';
import { TicketEvent } from '../models/TicketEvent';
import { Categoria } from '../models/Categoria';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { notificarMudancaStatus, notificarNovoComentario } from './notification.service';
import type {
  CriarTicketInput,
  AtualizarTicketInput,
} from '../validators/ticket.validators';

interface UsuarioContexto {
  id: string;
  papel: 'usuario' | 'tecnico';
}

interface ListarTicketsFiltros {
  status?: StatusChamado;
  categoria?: string;
  prioridade?: string;
  tecnicoResponsavel?: string;
  pagina: number;
  limite: number;
}

// InferSchemaType tipa campos `ref` como ObjectId; após `.populate(...)`
// eles viram o documento populado em runtime, mas o tipo estático não
// muda — este cast local é o mesmo idioma já usado em `garantirAcesso`
// (`ticket.solicitante._id`) para acessar os campos trazidos pelo populate.
interface ContatoPopulado {
  nome: string;
  email: string;
}

function contatoDoSolicitante(ticket: TicketDocument): ContatoPopulado {
  return ticket.solicitante as unknown as ContatoPopulado;
}

const CAMPOS_POPULAR = [
  { path: 'categoria', select: 'nome' },
  { path: 'solicitante', select: 'nome email' },
  { path: 'tecnicoResponsavel', select: 'nome email' },
];

export async function criarTicket(solicitanteId: string, dados: CriarTicketInput): Promise<TicketDocument> {
  const categoria = await Categoria.findById(dados.categoria);

  if (!categoria || !categoria.ativo) {
    throw new AppError('Categoria inválida.', 422);
  }

  const ticket = await Ticket.create({
    ...dados,
    solicitante: solicitanteId,
    status: 'aberto',
  });

  return ticket.populate(CAMPOS_POPULAR);
}

/**
 * Usuário comum só enxerga os próprios chamados; técnico/admin enxerga
 * todos e pode filtrar. A restrição é aplicada aqui, na camada de service,
 * não confiando em filtros vindos do cliente.
 */
export async function listarTickets(usuario: UsuarioContexto, filtros: ListarTicketsFiltros) {
  const query: FilterQuery<TicketDocument> = {};

  if (usuario.papel === 'usuario') {
    query.solicitante = usuario.id;
  }

  if (filtros.status) query.status = filtros.status;
  if (filtros.categoria) query.categoria = filtros.categoria;
  if (filtros.prioridade) query.prioridade = filtros.prioridade;
  if (filtros.tecnicoResponsavel) query.tecnicoResponsavel = filtros.tecnicoResponsavel;

  const skip = (filtros.pagina - 1) * filtros.limite;

  const [itens, total] = await Promise.all([
    Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filtros.limite)
      .populate(CAMPOS_POPULAR),
    Ticket.countDocuments(query),
  ]);

  return {
    itens,
    paginacao: {
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      totalPaginas: Math.ceil(total / filtros.limite) || 1,
    },
  };
}

async function buscarTicketOuFalhar(id: string): Promise<TicketDocument> {
  const ticket = await Ticket.findById(id).populate(CAMPOS_POPULAR);

  if (!ticket) {
    throw AppError.naoEncontrado('Chamado');
  }

  return ticket;
}

function garantirAcesso(ticket: TicketDocument, usuario: UsuarioContexto): void {
  const ehDono = String(ticket.solicitante._id ?? ticket.solicitante) === usuario.id;

  if (usuario.papel === 'usuario' && !ehDono) {
    throw AppError.proibido('Você só pode acessar os seus próprios chamados.');
  }
}

export async function buscarTicketPorId(id: string, usuario: UsuarioContexto): Promise<TicketDocument> {
  const ticket = await buscarTicketOuFalhar(id);
  garantirAcesso(ticket, usuario);
  return ticket;
}

export async function atualizarTicket(
  id: string,
  usuario: UsuarioContexto,
  dados: AtualizarTicketInput,
): Promise<TicketDocument> {
  const ticket = await buscarTicketOuFalhar(id);
  garantirAcesso(ticket, usuario);

  const ehDono = String(ticket.solicitante._id ?? ticket.solicitante) === usuario.id;

  if (usuario.papel === 'usuario') {
    if (!ehDono || ticket.status !== 'aberto') {
      throw AppError.proibido('O chamado só pode ser editado pelo solicitante enquanto estiver aberto.');
    }
  }

  if (dados.categoria) {
    const categoria = await Categoria.findById(dados.categoria);
    if (!categoria || !categoria.ativo) {
      throw new AppError('Categoria inválida.', 422);
    }
  }

  if (dados.titulo !== undefined) ticket.titulo = dados.titulo;
  if (dados.descricao !== undefined) ticket.descricao = dados.descricao;
  if (dados.categoria !== undefined) ticket.categoria = dados.categoria as unknown as typeof ticket.categoria;
  if (dados.prioridade !== undefined) ticket.prioridade = dados.prioridade;

  await ticket.save();
  return ticket.populate(CAMPOS_POPULAR);
}

export async function atualizarStatus(
  id: string,
  usuario: UsuarioContexto,
  novoStatus: StatusChamado,
): Promise<TicketDocument> {
  const ticket = await buscarTicketOuFalhar(id);

  const statusAtual = ticket.status as StatusChamado;
  const permitido = TRANSICOES_STATUS[statusAtual].includes(novoStatus);

  if (!permitido) {
    throw new AppError(`Não é possível mudar de "${statusAtual}" para "${novoStatus}".`, 422);
  }

  ticket.status = novoStatus;

  if (novoStatus === 'resolvido') {
    ticket.resolvedAt = new Date();
  }

  if (novoStatus === 'fechado') {
    ticket.closedAt = new Date();
  }

  // Reabrir cancela marcações de conclusão anteriores.
  if (novoStatus === 'em_andamento' || novoStatus === 'aberto') {
    ticket.resolvedAt = null;
    ticket.closedAt = null;
  }

  await ticket.save();

  await TicketEvent.create({
    ticket: ticket._id,
    autor: usuario.id,
    tipo: 'mudanca_status',
    statusAnterior: statusAtual,
    statusNovo: novoStatus,
  });

  const ticketPopulado = await ticket.populate(CAMPOS_POPULAR);

  // Fire-and-forget: notificação é best-effort e não deve segurar a
  // resposta da API esperando o SMTP responder (ver notification.service).
  void notificarMudancaStatus({
    destinatarioEmail: contatoDoSolicitante(ticketPopulado).email,
    destinatarioNome: contatoDoSolicitante(ticketPopulado).nome,
    ticketId: String(ticketPopulado._id),
    ticketTitulo: ticketPopulado.titulo,
    statusAnterior: statusAtual,
    statusNovo: novoStatus,
  });

  return ticketPopulado;
}

export async function atribuirTecnico(
  id: string,
  usuario: UsuarioContexto,
  tecnicoId: string,
): Promise<TicketDocument> {
  const ticket = await buscarTicketOuFalhar(id);

  const tecnico = await User.findById(tecnicoId);

  if (!tecnico || tecnico.papel !== 'tecnico' || !tecnico.ativo) {
    throw new AppError('Técnico inválido.', 422);
  }

  const statusAnterior = ticket.status as StatusChamado;

  ticket.tecnicoResponsavel = tecnico._id;

  if (ticket.status === 'aberto') {
    ticket.status = 'em_andamento';
  }

  await ticket.save();

  await TicketEvent.create({
    ticket: ticket._id,
    autor: usuario.id,
    tipo: 'atribuicao',
    tecnicoAtribuido: tecnico._id,
  });

  const ticketPopulado = await ticket.populate(CAMPOS_POPULAR);

  // Atribuir um técnico a um chamado "aberto" também muda o status —
  // solicitante merece a mesma notificação que receberia via PATCH /status.
  if (statusAnterior !== ticket.status) {
    void notificarMudancaStatus({
      destinatarioEmail: contatoDoSolicitante(ticketPopulado).email,
      destinatarioNome: contatoDoSolicitante(ticketPopulado).nome,
      ticketId: String(ticketPopulado._id),
      ticketTitulo: ticketPopulado.titulo,
      statusAnterior,
      statusNovo: ticket.status as StatusChamado,
    });
  }

  return ticketPopulado;
}

export async function adicionarComentario(id: string, usuario: UsuarioContexto, texto: string) {
  const ticket = await buscarTicketOuFalhar(id);
  garantirAcesso(ticket, usuario);

  const evento = await TicketEvent.create({
    ticket: ticket._id,
    autor: usuario.id,
    tipo: 'comentario',
    texto,
  });

  const ehDono = String(ticket.solicitante._id ?? ticket.solicitante) === usuario.id;

  // Só o solicitante é notificado, e só quando o comentário não é dele
  // mesmo — na prática, sempre que quem comentou é um técnico (o único
  // outro papel com acesso ao chamado, ver `garantirAcesso`).
  if (!ehDono) {
    const autor = await User.findById(usuario.id).select('nome');

    void notificarNovoComentario({
      destinatarioEmail: contatoDoSolicitante(ticket).email,
      destinatarioNome: contatoDoSolicitante(ticket).nome,
      ticketId: String(ticket._id),
      ticketTitulo: ticket.titulo,
      autorNome: autor?.nome ?? 'Suporte de TI',
      textoComentario: texto,
    });
  }

  return evento;
}

export async function buscarTimeline(id: string, usuario: UsuarioContexto) {
  const ticket = await buscarTicketOuFalhar(id);
  garantirAcesso(ticket, usuario);

  return TicketEvent.find({ ticket: id })
    .sort({ createdAt: 1 })
    .populate({ path: 'autor', select: 'nome papel' })
    .populate({ path: 'tecnicoAtribuido', select: 'nome' });
}
