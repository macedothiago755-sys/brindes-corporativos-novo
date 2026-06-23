import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required("DATABASE_URL", "postgresql://user:password@localhost:5432/rh_ia"),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",

  // Integração Slack (Event Subscriptions + Web API).
  slack: {
    signingSecret: process.env.SLACK_SIGNING_SECRET ?? "",
    botToken: process.env.SLACK_BOT_TOKEN ?? "",
  },

  // Integração WhatsApp Business (Meta Cloud API).
  whatsapp: {
    // Token arbitrário definido por nós e ecoado na verificação do webhook (GET).
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
    // App Secret do app Meta — usado para validar a X-Hub-Signature-256.
    appSecret: process.env.WHATSAPP_APP_SECRET ?? "",
    // Token de acesso permanente/temporário para chamar a Graph API.
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
    // ID do número de telefone remetente cadastrado no WhatsApp Business.
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    graphApiVersion: process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0",
  },
};
