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

- `POST /api/v1/tenants` — cria empresa cliente
- `POST /api/v1/jobs` — cria vaga (header `x-tenant-id` obrigatório; estrutura requisitos via IA — mockado)
- `GET /api/v1/jobs` / `GET /api/v1/jobs/:id`
- `POST /api/v1/jobs/:id/resumes` — upload de currículo PDF (multipart, campo `resume`) + análise IA mockada (`ai_score`, `ai_summary`)
- `POST /api/v1/knowledge/chunks` — adiciona conteúdo à base de conhecimento do tenant
- `POST /api/v1/knowledge/ask` — pergunta de funcionário, busca semântica mockada na base do tenant

Todas as rotas de `jobs` e `knowledge` exigem o header `x-tenant-id` (MVP — substituir por JWT autenticado em produção).

## O que é mock hoje

- Chamada à API da Anthropic Claude para estruturar vagas e analisar currículos (`src/modules/jobs/ai/claude.helper.ts`)
- Extração de texto do PDF do currículo
- Geração de embeddings e busca por similaridade na base de conhecimento (`embedding_vector_placeholder` é um `Float[]` vazio)
