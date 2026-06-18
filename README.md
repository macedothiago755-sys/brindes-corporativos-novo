# Brindes Corporativos

Site institucional + catálogo inteligente + sistema de orçamento para uma empresa de brindes corporativos personalizados. O site **não vende online** — o cliente navega pelo catálogo, monta um pedido de orçamento (produto, quantidade, cores, personalização) e a equipe comercial entra em contato.

## Stack

- **Next.js 16 (App Router)** + TypeScript
- **Tailwind CSS v4**
- Componentes de UI no estilo shadcn (escritos sobre Radix UI + CVA)
- **Framer Motion** para micro animações
- **Prisma + PostgreSQL**
- **NextAuth (Credentials)** para o painel administrativo
- Pronto para deploy na **Vercel**

## Estrutura

```
prisma/
  schema.prisma       Modelos: User, Category, Product, Quote, QuoteItem, Attachment
  seed.ts             Seed com categorias, 30 produtos e usuário admin
src/
  app/
    (site)/           Páginas públicas (home, catálogo, produto, sucesso)
    admin/             Painel administrativo (protegido por login)
    api/               Rotas de API (orçamentos, upload, auth, export)
    sitemap.ts, robots.ts
  components/
    site/              Header, footer, hero, seções da home, filtros, formulário de orçamento
    ui/                Componentes de UI base
  lib/                 prisma client, auth, validações (zod), rate limit
  proxy.ts             Protege as rotas /admin (Next 16 renomeou middleware -> proxy)
```

## Como rodar localmente

### 1. Pré-requisitos
- Node.js 20+
- PostgreSQL rodando localmente (ou Docker)

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Edite `DATABASE_URL` com a string de conexão do seu Postgres e gere um `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Criar o banco e popular dados iniciais
```bash
npm run db:migrate   # cria as tabelas
npm run db:seed       # popula categorias, 30 produtos e usuário admin
```

Login do painel administrativo criado pelo seed:
- **E-mail:** admin@brindescorporativos.com
- **Senha:** admin123

> Altere essa senha em produção.

### 5. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse http://localhost:3000 (site) e http://localhost:3000/admin (painel).

## Scripts disponíveis

| Comando              | Descrição                            |
|----------------------|---------------------------------------|
| `npm run dev`         | Inicia o servidor de desenvolvimento  |
| `npm run build`       | Build de produção                     |
| `npm run start`       | Inicia o servidor em modo produção    |
| `npm run lint`        | Lint do projeto                       |
| `npm run db:migrate`  | Executa migrações do Prisma           |
| `npm run db:seed`     | Popula o banco com dados iniciais     |
| `npm run db:studio`   | Abre o Prisma Studio                  |

## Fluxo de negócio

1. Cliente navega pelo catálogo (`/produtos`) com filtros por categoria e método de personalização.
2. Abre a página do produto (`/produto/[slug]`) com ficha técnica completa.
3. Clica em **"Montar orçamento"**, preenche quantidade, cor, personalização, método, dados da empresa e (opcionalmente) envia um arquivo de logo/arte.
4. O pedido é salvo nas tabelas `Quote`/`QuoteItem` com status `NOVO`.
5. A equipe comercial acessa `/admin/orcamentos`, visualiza os pedidos, altera o status (`Novo` → `Em análise` → `Respondido` → `Fechado`/`Perdido`) e adiciona observações.
6. O dashboard (`/admin`) mostra indicadores: novos orçamentos, em análise, taxa de conversão e produtos mais solicitados.

## Integrações preparadas

A estrutura está pronta para plugar:
- **E-mail** (ex.: Resend) — notificar a equipe comercial a cada novo orçamento.
- **WhatsApp Business API** — aviso automático de novo lead.
- **Google Analytics / Meta Pixel / GTM** — variáveis já previstas em `.env.example`.
- **CRM** — o endpoint `POST /api/quotes` é o ponto de extensão natural para disparar webhooks.

## Segurança

- Validação de entrada com Zod em todas as rotas de API.
- Rate limit simples por IP no envio de orçamentos (5 req/min).
- Upload de arquivos restrito por tipo MIME e tamanho (10MB), com nome de arquivo randomizado.
- Rotas `/admin/*` protegidas por sessão (NextAuth + `proxy.ts`).

## Deploy (Vercel)

1. Crie um banco PostgreSQL (Vercel Postgres, Neon, Supabase, etc.).
2. Configure as variáveis de ambiente do `.env.example` no projeto Vercel.
3. Rode `npx prisma migrate deploy` (ou configure como build step) e `npm run db:seed` (opcional, apenas na primeira vez).
4. Faça o deploy via `vercel` ou pela integração com o repositório Git.
