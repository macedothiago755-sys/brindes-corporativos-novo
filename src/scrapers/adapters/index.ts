import type { SupplierAdapter } from "../types";
import { exemploGenericoAdapter } from "./exemplo-generico";

/**
 * Registro central de adapters. Para adicionar um novo fornecedor:
 * crie um arquivo `nome-do-fornecedor.ts` nesta pasta seguindo o modelo
 * de `exemplo-generico.ts` e adicione a entrada abaixo.
 */
export const supplierAdapters: Record<string, SupplierAdapter> = {
  [exemploGenericoAdapter.key]: exemploGenericoAdapter,
};

export function getAdapter(key: string): SupplierAdapter | undefined {
  return supplierAdapters[key];
}

export function listAdapters(): SupplierAdapter[] {
  return Object.values(supplierAdapters);
}
