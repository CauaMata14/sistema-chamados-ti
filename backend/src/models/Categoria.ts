import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const categoriaSchema = new Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome da categoria é obrigatório'],
      trim: true,
      unique: true,
      maxlength: 60,
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: 240,
      default: '',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export type CategoriaDocument = HydratedDocument<InferSchemaType<typeof categoriaSchema>>;

export const Categoria = model('Categoria', categoriaSchema);
