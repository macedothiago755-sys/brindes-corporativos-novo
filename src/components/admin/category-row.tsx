"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

interface CategoryOption {
  id: string;
  name: string;
}

interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    active: boolean;
    order: number;
    metaTitle: string | null;
    metaDescription: string | null;
  };
  depth: number;
  parentOptions: CategoryOption[];
  productCount: number;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  toggleActiveAction: (formData: FormData) => void | Promise<void>;
}

export function CategoryRow({
  category,
  depth,
  parentOptions,
  productCount,
  updateAction,
  deleteAction,
  toggleActiveAction,
}: CategoryRowProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-border bg-muted/40">
        <td colSpan={5} className="px-4 py-3">
          <form
            action={async (formData) => {
              await updateAction(formData);
              setEditing(false);
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <Input name="name" defaultValue={category.name} required className="h-9 w-48" />
            <select
              name="parentId"
              defaultValue={category.parentId ?? ""}
              className="h-9 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="">— Categoria principal —</option>
              {parentOptions
                .filter((c) => c.id !== category.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <Input
              name="order"
              type="number"
              defaultValue={category.order}
              className="h-9 w-20"
              title="Ordem de prioridade"
            />
            <Input
              name="metaTitle"
              defaultValue={category.metaTitle ?? ""}
              placeholder="Título SEO"
              className="h-9 w-56"
            />
            <Input
              name="metaDescription"
              defaultValue={category.metaDescription ?? ""}
              placeholder="Descrição SEO"
              className="h-9 w-64"
            />
            <Button type="submit" size="sm">Salvar</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3" style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}>
        {depth > 0 && <span className="text-muted-foreground">↳ </span>}
        {category.name}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
      <td className="px-4 py-3 text-muted-foreground">{productCount}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            category.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
          }`}
        >
          {category.active ? "Ativa" : "Inativa"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <form action={toggleActiveAction}>
            <input type="hidden" name="id" value={category.id} />
            <ConfirmSubmitButton
              variant="outline"
              size="sm"
              confirmMessage={
                category.active
                  ? `Ocultar a categoria "${category.name}" do site público? Os produtos vinculados continuam intactos no admin.`
                  : `Reativar a categoria "${category.name}" no site público?`
              }
            >
              {category.active ? "Ocultar" : "Reativar"}
            </ConfirmSubmitButton>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={category.id} />
            <ConfirmSubmitButton
              variant="outline"
              size="sm"
              confirmMessage={`Excluir a categoria "${category.name}"? Só é possível se não houver subcategorias ou produtos vinculados.`}
            >
              Excluir
            </ConfirmSubmitButton>
          </form>
        </div>
      </td>
    </tr>
  );
}
