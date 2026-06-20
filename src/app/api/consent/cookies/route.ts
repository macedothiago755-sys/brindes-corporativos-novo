import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { COOKIE_CATEGORIES } from "@/lib/legal";

const SESSION_COOKIE = "brindes_consent_session";

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.consentStatus !== "string" || !Array.isArray(body.acceptedCategories)) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const acceptedCategories = body.acceptedCategories.filter((c: unknown) =>
    typeof c === "string" && COOKIE_CATEGORIES.includes(c as never)
  );

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  let sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) sessionId = randomUUID();

  await prisma.cookieConsent.create({
    data: {
      sessionId,
      userId,
      ipHash: hashIp(ip),
      consentStatus: body.consentStatus,
      acceptedCategories,
    },
  });

  const res = NextResponse.json({ ok: true }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
