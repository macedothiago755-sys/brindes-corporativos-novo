import type { Role } from "@prisma/client";

export type Permission =
  | "products:view"
  | "products:edit"
  | "products:delete"
  | "categories:edit"
  | "quotes:view"
  | "quotes:edit"
  | "customers:edit"
  | "importer:run"
  | "settings:edit"
  | "kits:edit"
  | "content:edit";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "products:view",
    "products:edit",
    "products:delete",
    "categories:edit",
    "quotes:view",
    "quotes:edit",
    "customers:edit",
    "importer:run",
    "settings:edit",
    "kits:edit",
    "content:edit",
  ],
  OPERADOR: ["products:view", "quotes:view", "quotes:edit", "customers:edit", "kits:edit"],
  VISUALIZADOR: ["products:view", "quotes:view"],
};

export function can(role: Role | string | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role as Role]?.includes(permission) ?? false;
}
