/**
 * Popula o banco com categorias padrão e um usuário técnico inicial, para
 * facilitar testar o sistema localmente logo após o `git clone`.
 *
 * Uso: npm run seed
 */
import bcrypt from 'bcrypt';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { Categoria } from '../src/models/Categoria';
import { User } from '../src/models/User';

const CATEGORIAS_PADRAO = [
  { nome: 'Hardware', descricao: 'Problemas com equipamentos físicos' },
  { nome: 'Software', descricao: 'Instalação, erros e configuração de programas' },
  { nome: 'Rede', descricao: 'Conectividade, Wi-Fi e acesso à internet' },
  { nome: 'Acesso e Contas', descricao: 'Senhas, permissões e criação de usuários' },
  { nome: 'Outros', descricao: 'Demais solicitações' },
];

const TECNICO_PADRAO = {
  nome: 'Técnico Padrão',
  email: 'tecnico@chamados.local',
  senha: 'Tecnico@123',
};

async function seed(): Promise<void> {
  await connectDatabase();

  for (const categoria of CATEGORIAS_PADRAO) {
    await Categoria.updateOne({ nome: categoria.nome }, { $setOnInsert: categoria }, { upsert: true });
  }
  console.warn(`[seed] ${CATEGORIAS_PADRAO.length} categorias garantidas.`);

  const tecnicoExistente = await User.findOne({ email: TECNICO_PADRAO.email });

  if (!tecnicoExistente) {
    const senhaHash = await bcrypt.hash(TECNICO_PADRAO.senha, 12);
    await User.create({
      nome: TECNICO_PADRAO.nome,
      email: TECNICO_PADRAO.email,
      senhaHash,
      papel: 'tecnico',
    });
    console.warn(`[seed] usuário técnico criado: ${TECNICO_PADRAO.email} / senha: ${TECNICO_PADRAO.senha}`);
  } else {
    console.warn('[seed] usuário técnico padrão já existe, mantido como está.');
  }

  await disconnectDatabase();
  console.warn('[seed] concluído.');
}

seed().catch((error) => {
  console.error('[seed] falhou:', error);
  process.exit(1);
});
