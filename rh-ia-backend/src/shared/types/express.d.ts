import type { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      auth?: {
        userId: string;
        tenantId: string;
        role: UserRole;
      };
    }
  }
}

export {};
