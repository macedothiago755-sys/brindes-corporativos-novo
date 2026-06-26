"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ColorImageMapper } from "@/components/admin/color-image-mapper";

interface CategoryOption {
  id: string;
  name: string;
  parentId?: string | null;
}

interface AttributeRow {
  name: string;
  value: string;
}

export interface ProductFormValues {
  name?: string;
  sku?: string | null;
  supplierCode?: string | null;
  brand?: string | null;
  status?: string;
  categoryId?: string;
  description?: string;
  shortDescription?: string | null;
  benefits?: string[];
  features?: string[];
  materials?: string[];
  colors?: string[];
  colorImages?: Record<string, string>;
  tags?: string[];
  price?: number | null;
  promoPrice?: number | null;
  saleUnit?: string | null;
  minQty?: number;
  leadTimeDays?: number;
  shippingDays?: number | null;
  dimensions?: string | null;
  printArea?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  images?: string[];
  attributes?: AttributeRow[];
  objectives?: string[];
  profile?: string | null;
  priceTier?: string | null;
  margin?: number | null;
  popularityScore?: number;
}

const objectiveOptions = [
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "EVENTO", label: "Evento corporativo" },
  { value: "CLIENTE_VIP", label: "Presente cliente VIP" },
  { value: "FEIRA", label: "Feira/exposição" },
  { value: "PREMIACAO", label: "Premiação" },
];

interface ProductFormProps {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
  defaultValues?: ProductFormValues;
  submitLabel: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Salvando..." : label}
    </Button>
  );
}

export function ProductForm({ action, categories, defaultValues = {}, submitLabel }: ProductFormProps) {
  // "Subcategoria" reaproveita a hierarquia de Category (parentId/children).
  // O valor realmente persistido em categoryId é o da subcategoria, se houver;
  // caso contrário, o da categoria-pai.
  const parentCategories = categories.filter((c) => !c.parentId);
  const childrenOf = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const selectedCategory = categories.find((c) => c.id === defaultValues.categoryId);
  const initialParentId = selectedCategory?.parentId ?? selectedCategory?.id ?? "";
  const initialSubId = selectedCategory?.parentId ? selectedCategory.id : "";

  const [parentId, setParentId] = useState(initialParentId);
  const [subId, setSubId] = useState(initialSubId);
  const subcategories = parentId ? childrenOf(parentId) : [];
  const effectiveCategoryId = subId || parentId;

  const [colorsText, setColorsText] = useState(defaultValues.colors?.join(", ") ?? "");
  const colorList = colorsText
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const [attributes, setAttributes] = useState<AttributeRow[]>(
    defaultValues.attributes && defaultValues.attributes.length > 0
      ? defaultValues.attributes
      : [{ name: "", value: "" }]
  );

  function addAttribute() {
    setAttributes((prev) => [...prev, { name: "", value: "" }]);
  }

  function removeAttribute(index: number) {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAttribute(index: number, field: "name" | "value", value: string) {
    setAttributes((prev) => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)));
  }

  return (
    <form action={action} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Informações principais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required defaultValue={defaultValues.name} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue={defaultValues.sku ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="supplierCode">Código do fornecedor</Label>
            <Input id="supplierCode" name="supplierCode" defaultValue={defaultValues.supplierCode ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" name="brand" defaultValue={defaultValues.brand ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="parentCategory">Categoria</Label>
            <select
              id="parentCategory"
              value={parentId}
              onChange={(e) => {
                setParentId(e.target.value);
                setSubId("");
              }}
              required
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="" disabled>
                Selecione...
              </option>
              {parentCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="subcategory">Subcategoria</Label>
            <select
              id="subcategory"
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              disabled={subcategories.length === 0}
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-50"
            >
              <option value="">
                {subcategories.length === 0 ? "Nenhuma subcategoria" : "Nenhuma (usar categoria)"}
              </option>
              {subcategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {/* Valor efetivo persistido: subcategoria se escolhida, senão a categoria-pai. */}
          <input type="hidden" name="categoryId" value={effectiveCategoryId} />
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={defaultValues.status ?? "RASCUNHO"}
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="ATIVO">Ativo</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="INDISPONIVEL">Indisponível</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descrição</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="shortDescription">Descrição curta</Label>
            <Input id="shortDescription" name="shortDescription" defaultValue={defaultValues.shortDescription ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="description">Descrição completa</Label>
            <Textarea id="description" name="description" required defaultValue={defaultValues.description} className="mt-2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="benefits">Benefícios (separados por vírgula)</Label>
              <Input id="benefits" name="benefits" defaultValue={defaultValues.benefits?.join(", ") ?? ""} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="features">Características técnicas (separadas por vírgula)</Label>
              <Input id="features" name="features" defaultValue={defaultValues.features?.join(", ") ?? ""} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="materials">Materiais (separados por vírgula)</Label>
              <Input id="materials" name="materials" defaultValue={defaultValues.materials?.join(", ") ?? ""} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="colors">Cores (separadas por vírgula)</Label>
              <Input
                id="colors"
                name="colors"
                value={colorsText}
                onChange={(e) => setColorsText(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="lançamento, promoção, mais vendido"
                defaultValue={defaultValues.tags?.join(", ") ?? ""}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comercial</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Preço</Label>
            <Input id="price" name="price" type="number" step="0.01" defaultValue={defaultValues.price ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="promoPrice">Preço promocional</Label>
            <Input id="promoPrice" name="promoPrice" type="number" step="0.01" defaultValue={defaultValues.promoPrice ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="saleUnit">Unidade de venda</Label>
            <Input id="saleUnit" name="saleUnit" defaultValue={defaultValues.saleUnit ?? "unidade"} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="minQty">Quantidade mínima</Label>
            <Input id="minQty" name="minQty" type="number" defaultValue={defaultValues.minQty ?? 50} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="leadTimeDays">Prazo de produção (dias)</Label>
            <Input id="leadTimeDays" name="leadTimeDays" type="number" defaultValue={defaultValues.leadTimeDays ?? 15} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="shippingDays">Prazo de entrega (dias)</Label>
            <Input id="shippingDays" name="shippingDays" type="number" defaultValue={defaultValues.shippingDays ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="dimensions">Dimensões</Label>
            <Input id="dimensions" name="dimensions" defaultValue={defaultValues.dimensions ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="printArea">Área de personalização</Label>
            <Input id="printArea" name="printArea" defaultValue={defaultValues.printArea ?? ""} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inteligência do catálogo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Objetivos compatíveis</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {objectiveOptions.map((o) => (
                <label key={o.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="objectives"
                    value={o.value}
                    defaultChecked={defaultValues.objectives?.includes(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="profile">Perfil</Label>
            <select
              id="profile"
              name="profile"
              defaultValue={defaultValues.profile ?? ""}
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Não definido</option>
              <option value="ECONOMICO">Econômico</option>
              <option value="INTERMEDIARIO">Intermediário</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
          <div>
            <Label htmlFor="priceTier">Faixa de preço</Label>
            <select
              id="priceTier"
              name="priceTier"
              defaultValue={defaultValues.priceTier ?? ""}
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Não definido</option>
              <option value="ENTRADA">Entrada</option>
              <option value="MEDIO">Médio</option>
              <option value="ALTO">Alto</option>
            </select>
          </div>
          <div>
            <Label htmlFor="margin">Margem (%)</Label>
            <Input id="margin" name="margin" type="number" step="0.01" defaultValue={defaultValues.margin ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="popularityScore">Popularidade</Label>
            <Input id="popularityScore" name="popularityScore" type="number" defaultValue={defaultValues.popularityScore ?? 0} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="metaTitle">Meta título</Label>
            <Input id="metaTitle" name="metaTitle" defaultValue={defaultValues.metaTitle ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta descrição</Label>
            <Input id="metaDescription" name="metaDescription" defaultValue={defaultValues.metaDescription ?? ""} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagens</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader name="images" defaultValue={defaultValues.images} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagens por cor</CardTitle>
        </CardHeader>
        <CardContent>
          <ColorImageMapper name="colorImages" colors={colorList} defaultValue={defaultValues.colorImages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atributos personalizados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {attributes.map((attr, index) => (
            <div key={index} className="flex gap-3">
              <Input
                placeholder="Nome (ex: Material)"
                name="attributeName"
                value={attr.name}
                onChange={(e) => updateAttribute(index, "name", e.target.value)}
              />
              <Input
                placeholder="Valor (ex: Algodão)"
                name="attributeValue"
                value={attr.value}
                onChange={(e) => updateAttribute(index, "value", e.target.value)}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => removeAttribute(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
            <Plus className="h-4 w-4" /> Adicionar atributo
          </Button>
        </CardContent>
      </Card>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
