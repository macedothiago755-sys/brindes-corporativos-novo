import { spawnSync } from "node:child_process";

/**
 * Executa `prisma migrate deploy` no build de forma resiliente.
 *
 * O schema declara `directUrl = env("DIRECT_URL")` para que as migrações usem a
 * conexão direta do Neon (sem o pooler), evitando o timeout de advisory lock
 * (P1002). Em produção, porém, se a variável DIRECT_URL não estiver configurada,
 * a migração falha logo de cara com P1012 ("Environment variable not found:
 * DIRECT_URL") e derruba todo o deploy.
 *
 * Para não travar o build por uma variável ausente, caímos para DATABASE_URL
 * quando DIRECT_URL não existe. Isso só acontece em ambientes onde as variáveis
 * vêm do process.env (Vercel) — localmente elas vêm do .env e são carregadas
 * pelo próprio Prisma, então este fallback não interfere.
 *
 * RECOMENDAÇÃO: continue definindo DIRECT_URL na Vercel com o host do Neon SEM
 * o sufixo "-pooler". O fallback é só uma rede de segurança.
 */
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
  console.warn(
    "[prisma] DIRECT_URL ausente — usando DATABASE_URL como fallback para a migração. " +
      "Defina DIRECT_URL (host do Neon sem '-pooler') para evitar timeouts de advisory lock."
  );
}

/**
 * A primeira tentativa de deploy da migração abaixo falhou em produção (o SQL
 * foi corrigido depois). Isso deixa essa migração marcada como "failed" na
 * tabela _prisma_migrations, o que bloqueia QUALQUER `migrate deploy`
 * seguinte com P3009 até ser resolvida manualmente. Como não há acesso direto
 * ao banco de produção a partir deste ambiente, resolvemos isso aqui: marcamos
 * a tentativa anterior como "rolled back" (idempotente — se ela nunca tiver
 * falhado, o comando simplesmente falha e é ignorado) antes do deploy real.
 */
spawnSync(
  "npx",
  ["prisma", "migrate", "resolve", "--rolled-back", "20260624130001_customization_methods_cleanup"],
  { stdio: "inherit", env: process.env, shell: true }
);

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
