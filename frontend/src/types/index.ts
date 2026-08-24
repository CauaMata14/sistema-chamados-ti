export type PapelUsuario = 'usuario' | 'tecnico';

export type StatusChamado = 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';

export type Prioridade = 'baixa' | 'media' | 'alta' | 'critica';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
}

export interface UsuarioResumo {
  _id: string;
  nome: string;
  email?: string;
}

export interface Categoria {
  _id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  titulo: string;
  descricao: string;
  categoria: Categoria | string;
  prioridade: Prioridade;
  status: StatusChamado;
  solicitante: UsuarioResumo;
  tecnicoResponsavel: UsuarioResumo | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

export type TipoEvento = 'comentario' | 'mudanca_status' | 'atribuicao';

export interface TicketEvent {
  _id: string;
  ticket: string;
  autor: { _id: string; nome: string; papel: PapelUsuario };
  tipo: TipoEvento;
  texto: string | null;
  statusAnterior: StatusChamado | null;
  statusNovo: StatusChamado | null;
  tecnicoAtribuido: { _id: string; nome: string } | null;
  createdAt: string;
}

export interface Paginacao {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface MetricasDashboard {
  totalChamados: number;
  porStatus: { status: StatusChamado; total: number }[];
  porCategoria: { categoriaId: string; categoria: string; total: number }[];
  tempoMedioResolucaoHoras: number | null;
}
