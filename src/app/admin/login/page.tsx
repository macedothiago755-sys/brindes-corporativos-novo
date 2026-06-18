"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Credenciais inválidas.");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-border bg-background p-8">
        <h1 className="text-xl font-semibold">Acesso administrativo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Entre com suas credenciais.</p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required className="mt-2" />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
