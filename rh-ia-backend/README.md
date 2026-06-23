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
- `POST /api/v1/knowledge/upload` — recebe o texto de um documento institucional, quebra em chunks (~1000 chars, overlap 200) e persiste vinculado ao tenant
- `POST /api/v1/knowledge/chunks` — adiciona um único chunk de conteúdo à base do tenant
- `POST /api/v1/knowledge/ask` — pergunta do colaborador: rankeia os chunks do tenant por TF-IDF/cosseno, injeta os top-3 como contexto e chama o Claude 3.5 Sonnet com prompt de sistema restrito ao contexto fornecido

Todas as rotas de `jobs` e `knowledge` exigem o header `x-tenant-id` (MVP — substituir por JWT autenticado em produção). O isolamento entre empresas é garantido filtrando `tenant_id` em toda query a `KnowledgeChunk`.

## O que é mock hoje

- Chamada à API da Anthropic Claude para estruturar vagas e analisar currículos (`src/modules/jobs/ai/claude.helper.ts`)
- Extração de texto do PDF do currículo

## O que já é real

- Chunking de documentos e persistência por tenant (`knowledge.service.ts`)
- Ranking de relevância por TF-IDF + similaridade de cosseno em memória (`shared/services/vector.service.ts`) — substitui embeddings, já que a Anthropic não expõe API de embeddings
- Resposta do assistente de RH via Claude 3.5 Sonnet com contexto restrito (`shared/services/anthropic.client.ts`), exige `ANTHROPIC_API_KEY` válida em `.env`
