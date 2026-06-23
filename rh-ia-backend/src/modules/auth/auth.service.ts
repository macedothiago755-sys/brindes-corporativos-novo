import type { UserRole } from "@prisma/client";
import { prisma } from "@/config/database";
import { ApiError } from "@/shared/utils/ApiError";
import { comparePassword, generateToken, hashPassword } from "@/shared/services/auth.service";

interface RegisterInput {
  companyName: string;
  name: string;
  email: string;
  password: string;
}

interface InviteUserInput {
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: { id: string; name: string; email: string; role: string; tenantId: string };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw ApiError.badRequest("Já existe um usuário com este e-mail");
    }

    const passwordHash = await hashPassword(input.password);

    const { tenant, user } = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { companyName: input.companyName },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: input.name,
          email: input.email,
          passwordHash,
          role: "ADMIN",
        },
      });

      return { tenant, user };
    });

    const token = generateToken({ userId: user.id, tenantId: tenant.id, role: user.role });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: tenant.id },
    };
  },

  /**
   * Cria um usuário adicional (RH/colaborador) dentro do tenant de quem
   * convida. Quem chama já deve ter sido autorizado (OWNER/ADMIN) pelo
   * middleware de rota — aqui só garantimos o vínculo correto ao tenant.
   */
  async inviteUser(input: InviteUserInput): Promise<AuthResult["user"]> {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw ApiError.badRequest("Já existe um usuário com este e-mail");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw ApiError.unauthorized("Credenciais inválidas");
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw ApiError.unauthorized("Credenciais inválidas");
    }

    const token = generateToken({ userId: user.id, tenantId: user.tenantId, role: user.role });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId },
    };
  },
};
