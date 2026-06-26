import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import * as Sentry from "@sentry/nextjs";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "application/pdf", "application/postscript"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo excede o tamanho máximo de 10MB." }, { status: 400 });
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido." }, { status: 400 });
  }

  const extension = path.extname(file.name).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, "");
  const filename = `${crypto.randomUUID()}${extension}`;

  // Em produção (Vercel) o filesystem é efêmero/somente-leitura: arquivos
  // gravados em /public não persistem nem são servidos. Quando há token de
  // Blob configurado, salvamos no Vercel Blob (persistente e com URL pública).
  // Em desenvolvimento, sem token, mantemos o disco local em /public/uploads.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        contentType: file.type || undefined,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    } catch (e) {
      Sentry.captureException(e);
      const msg = e instanceof Error ? e.message : "erro desconhecido";
      return NextResponse.json({ error: `Falha ao salvar o arquivo (${msg}).` }, { status: 500 });
    }
  }

  // Sem token de Blob configurado: em produção (Vercel) o filesystem é
  // efêmero/somente-leitura, então a escrita abaixo falharia silenciosamente.
  // Avisamos com uma mensagem acionável em vez de deixar cair no erro genérico.
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "Upload de imagens não configurado em produção. Crie um Vercel Blob Store e defina BLOB_READ_WRITE_TOKEN nas variáveis de ambiente do projeto.",
      },
      { status: 500 }
    );
  }

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (e) {
    Sentry.captureException(e);
    const msg = e instanceof Error ? e.message : "erro desconhecido";
    return NextResponse.json({ error: `Falha ao salvar o arquivo (${msg}).` }, { status: 500 });
  }
}
