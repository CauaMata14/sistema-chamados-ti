import { Schema, model, Types, type InferSchemaType, type HydratedDocument } from 'mongoose';

/**
 * Cada refresh token emitido gera um documento próprio (nunca o token em
 * texto puro, apenas o hash). Isso permite rotação com detecção de reuso:
 * ao usar um token, ele é marcado como revogado e substituído pelo próximo;
 * se um token já revogado for apresentado novamente, é sinal de token roubado
 * e todas as sessões daquele usuário podem ser invalidadas.
 */
const refreshTokenSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    substituidoPorHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDocument = HydratedDocument<InferSchemaType<typeof refreshTokenSchema>>;
export type RefreshTokenId = Types.ObjectId;

export const RefreshToken = model('RefreshToken', refreshTokenSchema);
