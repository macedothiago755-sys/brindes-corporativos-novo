import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Paint Colors — Brindes corporativos personalizados";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo-paint-colors.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d0f1a",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Barra de marca */}
        <div style={{ display: "flex", height: 10, width: 220, borderRadius: 9999, background: "linear-gradient(90deg, #7b2cbf, #d4148e, #2563eb)" }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={64} height={64} alt="" style={{ borderRadius: 12 }} />
            <span style={{ fontSize: 40, fontWeight: 700, color: "#ffffff" }}>Paint Colors</span>
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#ffffff", lineHeight: 1.1, maxWidth: 900 }}>
            Brindes corporativos personalizados
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#b8bdd0", marginTop: 24, maxWidth: 820 }}>
            Personalize com a marca da sua empresa e receba uma proposta sob medida.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#7b2cbf", fontWeight: 600 }}>
          paintcolorscompany.com
        </div>
      </div>
    ),
    { ...size }
  );
}
