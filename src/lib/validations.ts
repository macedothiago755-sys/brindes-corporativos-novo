import { z } from "zod";

export const quoteSchema = z.object({
  productId: z.string().min(1),
  quantidade: z.coerce.number().int().min(1).max(1_000_000),
  cores: z.array(z.string()).min(1, "Selecione ao menos uma cor"),
  personalizacao: z.array(z.string()).min(1, "Selecione ao menos uma opção"),
  metodo: z.array(z.string()).min(1, "Selecione um método de personalização"),
  clienteNome: z.string().min(2, "Informe seu nome"),
  empresa: z.string().min(2, "Informe sua empresa"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
  cidade: z.string().optional(),
  observacoes: z.string().max(2000).optional(),
  objetivo: z.string().optional(),
  prazo: z.string().optional(),
  couponCode: z.string().optional(),
  consentAceito: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar o Aviso de Privacidade para enviar o orçamento." }),
  }),
  consentVersion: z.string().min(1),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const leadSchema = z.object({
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
  consentAceito: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar a Política de Privacidade para continuar." }),
  }),
  consentVersion: z.string().min(1),
});

export type LeadInput = z.infer<typeof leadSchema>;

const kitQuoteItemSchema = z.object({
  productId: z.string().min(1),
  quantidade: z.coerce.number().int().min(1).max(1_000_000),
  cores: z.array(z.string()).default([]),
  personalizacao: z.array(z.string()).default([]),
  metodo: z.array(z.string()).default([]),
});

export const kitQuoteSchema = z.object({
  kitId: z.string().optional(),
  quantidadePessoas: z.coerce.number().int().min(1).optional(),
  orcamentoPorPessoa: z.coerce.number().positive().optional(),
  items: z.array(kitQuoteItemSchema).min(1, "Inclua ao menos um produto no kit"),
  clienteNome: z.string().min(2, "Informe seu nome"),
  empresa: z.string().min(2, "Informe sua empresa"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
  cidade: z.string().optional(),
  observacoes: z.string().max(2000).optional(),
  objetivo: z.string().optional(),
  prazo: z.string().optional(),
  couponCode: z.string().optional(),
  consentAceito: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar o Aviso de Privacidade para enviar o orçamento." }),
  }),
  consentVersion: z.string().min(1),
});

export type KitQuoteInput = z.infer<typeof kitQuoteSchema>;

const csvToArray = (value: unknown) =>
  String(value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const optionalNumber = z.coerce.number().nonnegative().optional().or(z.literal("").transform(() => undefined));

export const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto"),
  sku: z.string().optional(),
  supplierCode: z.string().optional(),
  brand: z.string().optional(),
  status: z.enum(["ATIVO", "RASCUNHO", "INDISPONIVEL"]),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  description: z.string().min(10, "A descrição completa é obrigatória"),
  shortDescription: z.string().optional(),
  benefits: z.preprocess(csvToArray, z.array(z.string())),
  features: z.preprocess(csvToArray, z.array(z.string())),
  materials: z.preprocess(csvToArray, z.array(z.string())),
  colors: z.preprocess(csvToArray, z.array(z.string())),
  tags: z.preprocess(csvToArray, z.array(z.string())),
  price: optionalNumber,
  promoPrice: optionalNumber,
  saleUnit: z.string().optional(),
  minQty: z.coerce.number().int().min(1).default(50),
  leadTimeDays: z.coerce.number().int().min(0).default(15),
  shippingDays: optionalNumber,
  dimensions: z.string().optional(),
  printArea: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  images: z.array(z.string()).default([]),
  attributeNames: z.array(z.string()).default([]),
  attributeValues: z.array(z.string()).default([]),
  objectives: z.array(z.enum(["ONBOARDING", "EVENTO", "CLIENTE_VIP", "FEIRA", "PREMIACAO"])).default([]),
  profile: z.enum(["ECONOMICO", "INTERMEDIARIO", "PREMIUM"]).optional(),
  priceTier: z.enum(["ENTRADA", "MEDIO", "ALTO"]).optional(),
  margin: optionalNumber,
  popularityScore: z.coerce.number().int().min(0).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
