import bcrypt from 'bcrypt';
import { User, type UserDocument } from '../models/User';
import { AppError } from '../utils/AppError';
import { emitirRefreshToken, gerarAccessToken, rotacionarTokens, revogarRefreshToken } from './token.service';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

const SALT_ROUNDS = 12;

// Hash "dummy" só para gastar o mesmo tempo de bcrypt.compare quando o
// e-mail não existe, evitando que a diferença de tempo de resposta revele
// se uma conta existe ou não (timing side-channel).
const HASH_FANTASMA = '$2b$12$l36NFO3zpi7kWeWWhNWQ.uRSDUoNcDWFppJTZsdh9j4AmeBr4Rg6m';

interface SessaoResult {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    papel: UserDocument['papel'];
  };
}

function paraUsuarioPublico(usuario: UserDocument): SessaoResult['usuario'] {
  return {
    id: String(usuario._id),
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  };
}

export async function registrar(dados: RegisterInput): Promise<SessaoResult> {
  const existente = await User.findOne({ email: dados.email });

  if (existente) {
    throw AppError.conflito('Já existe uma conta com este e-mail.');
  }

  const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);

  const usuario = await User.create({
    nome: dados.nome,
    email: dados.email,
    senhaHash,
    papel: 'usuario',
  });

  const accessToken = gerarAccessToken({ sub: String(usuario._id), papel: usuario.papel });
  const refreshToken = await emitirRefreshToken(String(usuario._id));

  return { accessToken, refreshToken, usuario: paraUsuarioPublico(usuario) };
}

export async function login(dados: LoginInput): Promise<SessaoResult> {
  const usuario = await User.findOne({ email: dados.email }).select('+senhaHash');

  // Mensagem genérica de propósito: não revela se o e-mail existe ou não.
  const credenciaisInvalidas = () => AppError.naoAutorizado('E-mail ou senha inválidos.');

  // Sempre compara contra um hash (real ou fantasma) para gastar o mesmo
  // tempo nos dois caminhos — evita revelar por timing se o e-mail existe.
  const senhaConfere = await bcrypt.compare(dados.senha, usuario?.senhaHash ?? HASH_FANTASMA);

  if (!usuario || !usuario.ativo || !senhaConfere) {
    throw credenciaisInvalidas();
  }

  const accessToken = gerarAccessToken({ sub: String(usuario._id), papel: usuario.papel });
  const refreshToken = await emitirRefreshToken(String(usuario._id));

  return { accessToken, refreshToken, usuario: paraUsuarioPublico(usuario) };
}

export async function atualizarSessao(refreshToken: string) {
  const resultado = await rotacionarTokens(refreshToken);
  return resultado;
}

export async function logout(refreshToken: string): Promise<void> {
  await revogarRefreshToken(refreshToken);
}

export async function buscarUsuarioAutenticado(usuarioId: string): Promise<SessaoResult['usuario']> {
  const usuario = await User.findById(usuarioId);

  if (!usuario) {
    throw AppError.naoAutorizado();
  }

  return paraUsuarioPublico(usuario);
}
