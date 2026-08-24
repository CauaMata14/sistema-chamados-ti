import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export const PRIORIDADES = ['baixa', 'media', 'alta', 'critica'] as const;
export type Prioridade = (typeof PRIORIDADES)[number];

export const STATUS_CHAMADO = ['aberto', 'em_andamento', 'resolvido', 'fechado'] as const;
export type StatusChamado = (typeof STATUS_CHAMADO)[number];

/**
 * Transições de status permitidas. Mantido junto ao model porque é uma
 * invariante do domínio, não uma regra de UI.
 */
export const TRANSICOES_STATUS: Record<StatusChamado, StatusChamado[]> = {
  aberto: ['em_andamento'],
  em_andamento: ['resolvido', 'aberto'],
  resolvido: ['fechado', 'em_andamento'],
  fechado: [],
};

const ticketSchema = new Schema(
  {
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    descricao: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
      minlength: 10,
      maxlength: 4000,
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: 'Categoria',
      required: true,
    },
    prioridade: {
      type: String,
      enum: PRIORIDADES,
      default: 'media',
      required: true,
    },
    status: {
      type: String,
      enum: STATUS_CHAMADO,
      default: 'aberto',
      required: true,
      index: true,
    },
    solicitante: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tecnicoResponsavel: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ticketSchema.index({ status: 1, categoria: 1 });
ticketSchema.index({ createdAt: -1 });

export type TicketDocument = HydratedDocument<InferSchemaType<typeof ticketSchema>>;

export const Ticket = model('Ticket', ticketSchema);
