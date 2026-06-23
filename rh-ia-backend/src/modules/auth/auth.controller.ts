import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "@/modules/auth/auth.service";

const registerSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  name: z.string().min(2, "Nome do usuário é obrigatório"),
  email: z.string().email(),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json({ data: result });
  },

  async login(req: Request, res: Response): Promise<void> {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.status(200).json({ data: result });
  },
};
