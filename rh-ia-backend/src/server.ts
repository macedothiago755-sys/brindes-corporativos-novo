import { createApp } from "@/app";
import { env } from "@/config/env";
import { connectDatabase, disconnectDatabase } from "@/config/database";

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`[rh-ia-backend] rodando na porta ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (): Promise<void> => {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("[rh-ia-backend] falha ao iniciar", error);
  process.exit(1);
});
