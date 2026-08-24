import { User } from '../models/User';

export async function listarTecnicos() {
  return User.find({ papel: 'tecnico', ativo: true }).select('nome email').sort({ nome: 1 });
}

export async function listarUsuarios() {
  return User.find({ ativo: true }).select('nome email papel').sort({ nome: 1 });
}
