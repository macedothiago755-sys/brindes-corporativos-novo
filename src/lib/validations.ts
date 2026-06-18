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
});

export type QuoteInput = z.infer<typeof quoteSchema>;
