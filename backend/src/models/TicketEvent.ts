import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { STATUS_CHAMADO } from './Ticket';

export const TIPOS_EVENTO = ['comentario', 'mudanca_status', 'atribuicao'] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];

/**
 * Timeline unificada do chamado: comentários e mudanças de status vivem na
 * mesma coleção, ordenados por createdAt, para renderizar um histórico
 * único sem precisar mesclar duas consultas na aplicação.
 */
const ticketEventSchema = new Schema(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    autor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tipo: {
      type: String,
      enum: TIPOS_EVENTO,
      required: true,
    },
    texto: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    statusAnterior: {
      type: String,
      enum: STATUS_CHAMADO,
      default: null,
    },
    statusNovo: {
      type: String,
      enum: STATUS_CHAMADO,
      default: null,
    },
    tecnicoAtribuido: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
);

ticketEventSchema.index({ ticket: 1, createdAt: 1 });

export type TicketEventDocument = HydratedDocument<InferSchemaType<typeof ticketEventSchema>>;

export const TicketEvent = model('TicketEvent', ticketEventSchema);
