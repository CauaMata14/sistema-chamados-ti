# Central de Chamados de TI

Sistema full-stack de abertura e acompanhamento de chamados de suporte técnico, desenvolvido como projeto de portfólio. Permite que usuários abram chamados e acompanhem seu andamento, enquanto técnicos assumem, atualizam o status e resolvem os chamados, com métricas consolidadas em um dashboard.

## Stack

| Camada          | Tecnologias |
|-----------------|-------------|
| Front-end       | Next.js 14 (App Router) · TypeScript · Tailwind CSS · React Hook Form · Zod · Recharts |
| Back-end        | Node.js · Express · TypeScript |
| Banco de dados  | MongoDB · Mongoose |
| Autenticação    | JWT (access token + refresh token com rotação) |
| Validação       | Zod (front e back) |

## Prints

_Screenshots do sistema em funcionamento serão adicionados aqui após a primeira execução local (tela de login, listagem de chamados, detalhe do chamado com timeline, e dashboard)._

## Estrutura do projeto

```
sistema-chamados-ti/
├── backend/     # API REST (Express + TypeScript + MongoDB)
└── frontend/    # Aplicação web (Next.js App Router)
```

Cada pasta tem seu próprio `package.json`, `.env.example` e ciclo de vida independente — rode os comandos abaixo dentro de cada uma.

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Uma instância do MongoDB acessível (local via `mongod`, Docker, ou um cluster gratuito no MongoDB Atlas)

### 1. Back-end

```bash
cd backend
cp .env.example .env    # edite MONGODB_URI e os segredos JWT
npm install
npm run seed             # opcional: cria categorias padrão e um usuário técnico de teste
npm run dev               # sobe a API em http://localhost:3333
```

Usuário técnico criado pelo seed (apenas para teste local):
`tecnico@chamados.local` / `Tecnico@123`

### 2. Front-end

Em um segundo terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # sobe a aplicação em http://localhost:3000
```

Acesse `http://localhost:3000`, cadastre uma conta (papel `usuario`) para abrir chamados, ou entre com o técnico criado pelo seed para atender e gerenciar chamados.

### Scripts úteis

| Comando (dentro de `backend/` ou `frontend/`) | O que faz |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento com hot reload |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos TypeScript, sem gerar arquivos |

## Variáveis de ambiente

### `backend/.env`

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `development`, `test` ou `production` |
| `PORT` | Porta da API (padrão `3333`) |
| `MONGODB_URI` | String de conexão do MongoDB |
| `JWT_ACCESS_SECRET` | Segredo do access token (mín. 16 caracteres) |
| `JWT_ACCESS_EXPIRES_IN` | Validade do access token (ex: `15m`) |
| `JWT_REFRESH_SECRET` | Segredo do refresh token — **diferente** do access token |
| `JWT_REFRESH_EXPIRES_IN` | Validade do refresh token (ex: `7d`) |
| `CORS_ORIGIN` | Origem exata permitida (URL do front-end, nunca `*`) |
| `AUTH_RATE_LIMIT_WINDOW_MS` / `AUTH_RATE_LIMIT_MAX` | Janela e limite de tentativas nas rotas de autenticação |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Opcionais — notificação por e-mail em mudança de status. Sem `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`, o envio fica desativado (log de aviso, sistema continua funcionando normalmente) |

### `frontend/.env`

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API (ex: `http://localhost:3333/api`) |

Nenhum segredo é commitado: os arquivos `.env` estão no `.gitignore`, apenas os `.env.example` versionados.

## Modelo de dados

- **User** — `nome`, `email`, `senhaHash` (bcrypt), `papel` (`usuario` | `tecnico`), `ativo`.
- **RefreshToken** — um documento por token emitido (hash SHA-256, nunca o token em texto puro), com `revokedAt` e `substituidoPorHash` para rastrear a cadeia de rotação e detectar reuso.
- **Categoria** — entidade própria (não um enum fixo), gerenciável pelos técnicos: `nome`, `descricao`, `ativo`.
- **Ticket** — `titulo`, `descricao`, `categoria`, `prioridade`, `status`, `solicitante`, `tecnicoResponsavel`, `resolvedAt`, `closedAt`.
- **TicketEvent** — timeline unificada do chamado: comentários, mudanças de status e atribuições de técnico, todos na mesma coleção, ordenados por data.

## Endpoints principais da API

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/categories
POST   /api/categories            (técnico)
PATCH  /api/categories/:id        (técnico)
DELETE /api/categories/:id        (técnico)

POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id
PATCH  /api/tickets/:id/status    (técnico)
PATCH  /api/tickets/:id/assign    (técnico)
POST   /api/tickets/:id/comments
GET    /api/tickets/:id/timeline

GET    /api/dashboard/metrics     (técnico)
GET    /api/users/technicians     (técnico)
```

## Decisões de arquitetura

**Camadas no back-end (`routes → controllers → services → models`).**
Controllers só traduzem HTTP em chamadas de service e devolvem a resposta; toda regra de negócio (transições de status válidas, checagem de posse de um chamado, rotação de refresh token) vive nos services, testável e reutilizável independentemente do Express.

**Refresh token como JWT, mas com estado no banco.**
O refresh token é um JWT assinado com expiração, porém cada emissão grava o hash (SHA-256) em uma coleção própria (`RefreshToken`). Isso combina o formato stateless do JWT com a capacidade de revogar sessões e detectar reuso: se um token já revogado for apresentado novamente — sinal de possível roubo — todas as sessões daquele usuário são invalidadas. O access token nunca é persistido; a validade curta (15 min) já limita o estrago de um vazamento.

**Access token só em memória no front-end, refresh token em cookie httpOnly.**
O access token não é salvo em `localStorage` (reduz superfície de XSS); ele vive em um `AuthContext` em memória e é recuperado a cada carregamento de página chamando `/auth/refresh`, que usa o cookie httpOnly (inacessível a JavaScript) para emitir um novo par de tokens.

**Categoria como coleção, não enum fixo.**
Categorias de chamado são uma entidade própria com CRUD (soft delete via `ativo`), gerenciável pelos técnicos sem precisar de deploy. Isso também deixa a arquitetura pronta para o módulo futuro de sugestão automática de categoria por IA: bastaria um service que recebe título/descrição e devolve o `_id` de uma categoria existente.

**Timeline unificada (`TicketEvent`).**
Comentários, mudanças de status e atribuições de técnico ficam na mesma coleção, com um campo `tipo` discriminando o formato. Isso evita ter que mesclar duas coleções (comentários + histórico de status) toda vez que a UI precisa mostrar "tudo que aconteceu com este chamado" em ordem cronológica.

**Autorização sempre no back-end.**
Cada rota sensível valida papel (`RBAC`) e posse do recurso na camada de service — por exemplo, um usuário comum só edita o próprio chamado enquanto ele estiver "aberto", e essa regra é aplicada mesmo que a UI não escondesse o formulário de edição.

**Monorepo com duas pastas independentes.**
`backend/` e `frontend/` vivem lado a lado neste repositório, cada um com seu próprio `package.json`, para facilitar rodar e apresentar o projeto sem a complexidade de um workspace tooling (Turborepo/pnpm workspaces) desnecessária para o tamanho do projeto. Os schemas Zod são duplicados propositalmente entre front e back (arquivos em `frontend/src/schemas` e `backend/src/validators`): o back-end nunca confia apenas na validação do front-end.

## Segurança

- Senhas com `bcrypt` (12 salt rounds).
- `helmet` para cabeçalhos HTTP seguros.
- CORS restrito a uma origem explícita, com `credentials: true` para o cookie do refresh token.
- Sanitização de `body`/`query`/`params` contra operadores NoSQL (`express-mongo-sanitize`) antes de qualquer query.
- Rate limiting nas rotas de autenticação (`express-rate-limit`).
- Validação de todo input no back-end com Zod, independentemente da validação do front-end.
- Mensagens de erro genéricas para o cliente; detalhes internos só aparecem em log de servidor (nunca na resposta HTTP em produção).
- Todas as variáveis sensíveis via `.env`, nunca hardcoded.

## Notificações por e-mail

Quando um técnico muda o status de um chamado (diretamente via `PATCH /tickets/:id/status`, ou implicitamente ao assumir um chamado "aberto", que passa a "em_andamento"), o solicitante recebe um e-mail avisando a transição.

- **Best-effort e assíncrono**: o envio roda em segundo plano (`notification.service.ts` → `email.service.ts`) e nunca lança — uma falha de SMTP fica só no log do servidor, não vira erro 500 nem atrasa a resposta da API. A mudança de status já foi persistida antes de a notificação ser disparada.
- **Opcional por padrão**: sem `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` configurados, o serviço não tenta enviar nada (um aviso único no log) — não é necessário ter um servidor SMTP para rodar o projeto localmente.
- Para testar o envio real sem gastar uma conta de e-mail de verdade, uma conta gratuita em [ethereal.email](https://ethereal.email) funciona como SMTP de teste (a mensagem "chega" numa inbox falsa, nunca é entregue de verdade).

## Próximos passos (fora do escopo desta primeira entrega)

- Módulo de sugestão automática de categoria via IA, usando a arquitetura já preparada em `Categoria`.
- Testes automatizados (unitários nos services, integração nas rotas).
