import { Categoria } from '../models/Categoria';
import { AppError } from '../utils/AppError';
import type { CriarCategoriaInput, AtualizarCategoriaInput } from '../validators/categoria.validators';

export async function listarCategorias(apenasAtivas = false) {
  const filtro = apenasAtivas ? { ativo: true } : {};
  return Categoria.find(filtro).sort({ nome: 1 });
}

export async function criarCategoria(dados: CriarCategoriaInput) {
  const existente = await Categoria.findOne({ nome: dados.nome });

  if (existente) {
    throw AppError.conflito('Já existe uma categoria com este nome.');
  }

  return Categoria.create(dados);
}

export async function atualizarCategoria(id: string, dados: AtualizarCategoriaInput) {
  const categoria = await Categoria.findById(id);

  if (!categoria) {
    throw AppError.naoEncontrado('Categoria');
  }

  if (dados.nome !== undefined) categoria.nome = dados.nome;
  if (dados.descricao !== undefined) categoria.descricao = dados.descricao;
  if (dados.ativo !== undefined) categoria.ativo = dados.ativo;

  await categoria.save();
  return categoria;
}

export async function removerCategoria(id: string): Promise<void> {
  const categoria = await Categoria.findById(id);

  if (!categoria) {
    throw AppError.naoEncontrado('Categoria');
  }

  // Soft delete: mantém integridade referencial com tickets já criados.
  categoria.ativo = false;
  await categoria.save();
}
