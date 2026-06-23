# Deploy — RH IA (rh-ia-backend + rh-ia-frontend)

Guia de deploy em produção do módulo RH IA. Os dois apps são independentes
(cada um com seu próprio `Dockerfile`) e se comunicam via HTTP usando
`NEXT_PUBLIC_API_URL`.

> **Segurança**: nenhum valor real de credencial/chave está fixado em
> nenhum arquivo deste repositório. Todo segredo é injetado via variável de
> ambiente no provedor de hospedagem (ou em um `.env` local nunca commitado,
> veja `.env.rh-ia.example`).

## 1. Simulação local de produção (Docker Compose)

```bash
cp .env.rh-ia.example .env   # preencha POSTGRES_PASSWORD, JWT_SECRET, ANTHROPIC_API_KEY
docker compose up --build
```

Isso sobe Postgres + backend (porta 3001, migrações aplicadas automaticamente
via `db:deploy` antes do `npm start`) + frontend (porta 3000).

## 2. Pipeline de CI

`.github/workflows/deploy.yml` roda em push/PR para `main`, tocando
`rh-ia-backend/` e `rh-ia-frontend/`: instala dependências, gera o Prisma
Client, faz typecheck/lint, roda testes (se existirem) e builda os dois
apps. Ele **não** faz deploy automático — apenas garante que o código builda
antes de promovê-lo. O deploy real (push de imagem / trigger no PaaS) deve
ser configurado separadamente conforme o provedor escolhido abaixo.

## 3. Migração de banco em produção

`rh-ia-backend/package.json` tem o script:

```json
"db:deploy": "prisma migrate deploy"
```

Diferente de `prisma migrate dev`, `migrate deploy` apenas aplica migrações
já existentes em `prisma/migrations/` (sem gerar novas, sem prompts) — seguro
para rodar automaticamente a cada deploy. O `Dockerfile` do backend já
executa `npm run db:deploy && npm start` como comando de inicialização do
container, então as migrações são aplicadas antes do servidor aceitar
requisições.

## 4. Deploy em um PaaS

### Opção A — Render / Railway (mais simples)

1. Crie um banco PostgreSQL gerenciado (Render Postgres / Railway Postgres) e
   copie a `DATABASE_URL` gerada.
2. Crie um serviço **Web Service** apontando para `rh-ia-backend/` (usa o
   `Dockerfile` do diretório). Configure as variáveis de ambiente da seção 5.
3. Crie um segundo **Web Service** apontando para `rh-ia-frontend/`. Configure
   `NEXT_PUBLIC_API_URL` com a URL pública do serviço do backend (ex.:
   `https://rh-ia-backend.onrender.com/api/v1`).
4. Habilite deploy automático a partir da branch `main` (o provedor builda a
   imagem a partir do `Dockerfile` a cada push).

### Opção B — AWS App Runner

1. Publique as imagens dos dois `Dockerfile`s em um registro (ECR).
2. Crie um serviço App Runner por imagem, apontando para a respectiva tag no
   ECR.
3. Configure as variáveis de ambiente de cada serviço pelo painel do App
   Runner (ou via AWS Secrets Manager + referência no serviço — nunca em
   texto puro no repositório).
4. Use RDS PostgreSQL como banco gerenciado e aponte `DATABASE_URL` para ele.

Em qualquer uma das opções, o container do backend já aplica as migrações
automaticamente no boot (passo 3 acima) — não é necessário rodar
`prisma migrate deploy` manualmente.

## 5. Variáveis de ambiente

### `rh-ia-backend`

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | não (default `3001`) | Porta HTTP do servidor Express |
| `NODE_ENV` | recomendado `production` | Ambiente de execução |
| `DATABASE_URL` | sim | String de conexão PostgreSQL (`postgresql://user:pass@host:5432/db?schema=public`) |
| `JWT_SECRET` | sim | Segredo usado para assinar/verificar os JWTs de autenticação |
| `ANTHROPIC_API_KEY` | sim (para usar os recursos de IA) | Chave da API da Anthropic, usada na estruturação de vagas, análise de currículos e no assistente RAG |

### `rh-ia-frontend`

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | sim | URL pública e completa da API do backend, incluindo o prefixo `/api/v1` (ex.: `https://api.seudominio.com/api/v1`). Usada em build-time (é embutida no bundle do Next.js) — defina como build arg/env do provedor antes do build. |

Nenhuma dessas variáveis possui valor de exemplo real neste repositório —
preencha-as apenas no painel do provedor de hospedagem ou em um `.env` local
não commitado.
