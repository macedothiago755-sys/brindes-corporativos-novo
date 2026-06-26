import { prisma } from "@/lib/prisma";

type AuditAction = "ACCESS" | "EXPORT" | "DELETE" | "ANONYMIZE";

export async function logAudit(userId: string | null, action: AuditAction, targetType: string, targetId?: string) {
  await prisma.auditLog.create({
    data: { userId, action, targetType, targetId },
  });
}
