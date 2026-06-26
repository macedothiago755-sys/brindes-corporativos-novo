import ExcelJS from "exceljs";

export interface ExportRow {
  nome: string;
  codigo: string;
  categoria: string;
  preco: string;
  descricao: string;
  imagem: string;
  atributos: string;
}

function csvEscape(value: string): string {
  const needsQuotes = /[",\n;]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function toCsv(rows: ExportRow[]): string {
  const header = ["nome", "codigo", "categoria", "preco", "descricao", "imagem", "atributos"];
  const lines = [header.join(";")];
  for (const row of rows) {
    lines.push(
      [row.nome, row.codigo, row.categoria, row.preco, row.descricao, row.imagem, row.atributos]
        .map(csvEscape)
        .join(";")
    );
  }
  return "﻿" + lines.join("\n");
}

export async function toXlsx(rows: ExportRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Catálogo");
  sheet.columns = [
    { header: "Nome", key: "nome", width: 35 },
    { header: "Código", key: "codigo", width: 15 },
    { header: "Categoria", key: "categoria", width: 20 },
    { header: "Preço", key: "preco", width: 15 },
    { header: "Descrição", key: "descricao", width: 50 },
    { header: "Imagem", key: "imagem", width: 40 },
    { header: "Atributos", key: "atributos", width: 40 },
  ];
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
