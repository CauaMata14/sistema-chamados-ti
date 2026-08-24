import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export const PAPEIS_USUARIO = ['usuario', 'tecnico'] as const;
export type PapelUsuario = (typeof PAPEIS_USUARIO)[number];

const userSchema = new Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    senhaHash: {
      type: String,
      required: true,
      select: false, // nunca vem por padrão em queries
    },
    papel: {
      type: String,
      enum: PAPEIS_USUARIO,
      default: 'usuario',
      required: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const User = model('User', userSchema);
