import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Este app vive ao lado de outro projeto Node na raiz do monorepo;
  // fixamos o root de tracing para evitar a inferência por múltiplos lockfiles.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
