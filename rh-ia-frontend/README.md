# RH IA — Frontend

Painel Next.js (App Router + TypeScript + Tailwind) para gestão de vagas e
triagem de candidatos assistida por IA. Consome o `rh-ia-backend`.

## Como rodar

```bash
cd rh-ia-frontend
cp .env.example .env.local   # ajuste NEXT_PUBLIC_API_URL se necessário
npm install
npm run dev                  # http://localhost:3000
```

O backend (`rh-ia-backend`) precisa estar rodando (porta 3001 por padrão).

## Telas

- `/login` — login/cadastro de empresa (guarda o JWT no `localStorage`)
- `/dashboard/vagas` — lista de vagas + modal "Nova Vaga" com geração por IA
  (loader com frases dinâmicas) e campos editáveis do resultado
- `/dashboard/vagas/[id]` — duas colunas:
  - **Esquerda**: descrição estruturada da vaga (resumo, responsabilidades,
    requisitos, diferenciais)
  - **Direita**: dropzone para upload de múltiplos PDFs com barra de progresso
    por arquivo, tabela de ranking ordenada por `ai_score` (verde > 70,
    amarelo 50–70, vermelho < 50) e drawer "Ver Avaliação" com resumo, pontos
    fortes e perguntas de entrevista

## Notas

- Autenticação via `Authorization: Bearer <token>` em todas as chamadas; `401`
  redireciona para `/login`.
- O upload usa `XMLHttpRequest` para expor progresso real de envio. Como o
  backend ainda não tem `GET /jobs/:id/resumes`, a lista de candidatos é
  mantida em estado React a partir das respostas de upload — atualiza sem F5.
- Nome/e-mail do candidato são derivados do nome do arquivo PDF (o backend os
  exige); quando houver extração real de PDF no backend, podem vir de lá.
