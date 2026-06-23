# RH IA — Backend (MVP)

API multi-tenant em Express + TypeScript + Prisma para a plataforma RH IA.
Serviço isolado dentro deste monorepo, sem dependência do app Next.js de brindes.

## Como rodar

```bash
cd rh-ia-backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run dev
```

## Endpoints (v1)

- `POST /api/v1/auth/register` — cria a empresa (tenant) + usuário administrador (role `ADMIN`), retorna JWT
- `POST /api/v1/auth/login` — autentica e retorna JWT
- `POST /api/v1/auth/users` — convida um novo usuário do tenant com um papel (`ADMIN`/`RECRUITER`/`EMPLOYEE`) — restrito a `OWNER`/`ADMIN`
- `POST /api/v1/tenants` — gerenciamento administrativo avulso de tenants (uso interno)
- `POST /api/v1/jobs`, `GET /api/v1/jobs`, `GET /api/v1/jobs/:id`, `POST /api/v1/jobs/:id/resumes` — gestão de vagas e currículos, restrito à equipe de RH (`OWNER`/`ADMIN`/`RECRUITER`)
- `POST /api/v1/knowledge/upload`, `POST /api/v1/knowledge/chunks` — manutenção da base de conhecimento, restrito à equipe de RH (`OWNER`/`ADMIN`/`RECRUITER`)
- `POST /api/v1/knowledge/ask` — qualquer colaborador autenticado do tenant pode perguntar ao assistente; rankeia os chunks por TF-IDF/cosseno, injeta os top-3 como contexto e chama o Claude 3.5 Sonnet com prompt de sistema restrito ao contexto fornecido
- `POST /api/v1/webhooks/stripe` — rota pública (sem JWT) para eventos de pagamento

Todas as rotas (exceto `/auth/register`, `/auth/login` e `/webhooks/stripe`) exigem `Authorization: Bearer <token>`. `tenantId`, `userId` e `role` vêm **exclusivamente** do payload do token, nunca de body/query/params — isso é o que garante isolamento entre empresas clientes. Autorização por papel é feita pelo middleware `requireRole` (`shared/middlewares/requireRole.ts`): falta de papel adequado retorna `403`, distinto do `401` de autenticação ausente/inválida.

## Billing e limites de plano

- `Tenant.plan` (`STARTER` | `GROWTH` | `PRO`) e `Tenant.status` (`ACTIVE` | `PAST_DUE` | `CANCELED`) controlam o acesso. Novo tenant nasce `STARTER`/`ACTIVE`.
- `UsageLog` registra cada chamada de IA bem-sucedida (`JOB_CREATION`, `RESUME_ANALYSIS`, `KNOWLEDGE_ASK`) por tenant/mês.
- `checkPlanLimits(feature)` (`shared/middlewares/billing.middleware.ts`) roda logo após `requireAuth`/`requireRole` nas rotas que chamam IA:
  - `status !== ACTIVE` → `402 Payment Required` (bloqueia inadimplentes/cancelados antes de qualquer chamada de IA)
  - uso do mês ≥ limite do plano para a feature → `403 Forbidden` ("Limite do plano atingido. Faça o upgrade")
  - limites definidos em `shared/services/planLimits.ts`: `STARTER` (2 vagas/mês, 150 currículos/mês), `GROWTH` (6 vagas/mês, 600 currículos/mês); `PRO` e `KNOWLEDGE_ASK` em qualquer plano são ilimitados neste MVP
- O registro em `UsageLog` só ocorre **depois** do sucesso da chamada de IA no controller — uma tentativa bloqueada por `402`/`403` nunca é contabilizada.
- `POST /webhooks/stripe` processa `checkout.session.completed` (ativa o tenant e define o plano a partir de `client_reference_id`/`metadata.plan`) e `invoice.payment_failed` (marca `PAST_DUE`, bloqueando a IA no próximo request). Não há verificação de assinatura do webhook neste MVP — necessária antes de produção.

## O que é mock hoje

- Chamada à API da Anthropic Claude para estruturar vagas e analisar currículos (`src/modules/jobs/ai/claude.helper.ts`)
- Extração de texto do PDF do currículo

## O que já é real

- Chunking de documentos e persistência por tenant (`knowledge.service.ts`)
- Ranking de relevância por TF-IDF + similaridade de cosseno em memória (`shared/services/vector.service.ts`) — substitui embeddings, já que a Anthropic não expõe API de embeddings
- Resposta do assistente de RH via Claude 3.5 Sonnet com contexto restrito (`shared/services/anthropic.client.ts`), exige `ANTHROPIC_API_KEY` válida em `.env`
- Autenticação via JWT (`shared/services/auth.service.ts`) com hash de senha (bcrypt) e middleware `requireAuth` (`shared/middlewares/tenant.middleware.ts`) que injeta `req.tenantId`/`req.userId`/`req.userRole` a partir do token
