"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "brindes:cookie-consent";

type Preferences = {
  essenciais: true;
  analise: boolean;
  marketing: boolean;
};

const DEFAULT_PREFERENCES: Preferences = { essenciais: true, analise: false, marketing: false };

function acceptedCategoriesFrom(preferences: Preferences) {
  return (Object.keys(preferences) as (keyof Preferences)[]).filter((key) => preferences[key]);
}

async function persistConsent(status: string, preferences: Preferences) {
  try {
    await fetch("/api/consent/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consentStatus: status, acceptedCategories: acceptedCategoriesFrom(preferences) }),
    });
  } catch {
    // registro de consentimento é best-effort; não deve bloquear a navegação
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function save(status: string, prefs: Preferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, preferences: prefs }));
    setPreferences(prefs);
    setVisible(false);
    setPreferencesOpen(false);
    persistConsent(status, prefs);
  }

  if (!visible && !preferencesOpen) return null;

  return (
    <>
      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur sm:p-6">
          <div className="container-premium flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Utilizamos cookies para melhorar sua experiência, analisar navegação e personalizar conteúdos. Você
              pode aceitar ou gerenciar suas preferências. Saiba mais em nosso{" "}
              <Link href="/politica-de-privacidade" className="font-medium text-foreground underline">
                Aviso de Privacidade
              </Link>
              .
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreferencesOpen(true)}>
                Configurar preferências
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => save("recusado_opcionais", { essenciais: true, analise: false, marketing: false })}
              >
                Recusar opcionais
              </Button>
              <Button size="sm" variant="gradient" onClick={() => save("aceito_todos", { essenciais: true, analise: true, marketing: true })}>
                Aceitar todos
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preferências de cookies</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha quais categorias de cookies você autoriza durante sua navegação no site da Paint Colors.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Cookies essenciais</p>
                <p className="text-xs text-muted-foreground">
                  Necessários para login, segurança e funcionamento do site. Não podem ser desativados.
                </p>
              </div>
              <Checkbox checked disabled />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Cookies de análise</p>
                <p className="text-xs text-muted-foreground">
                  Nos ajudam a entender como você usa o site (ex: Google Analytics) para melhorar a experiência.
                </p>
              </div>
              <Checkbox
                checked={preferences.analise}
                onCheckedChange={(checked) => setPreferences((p) => ({ ...p, analise: checked === true }))}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Cookies de marketing</p>
                <p className="text-xs text-muted-foreground">
                  Usados para personalizar campanhas e remarketing de acordo com seu interesse.
                </p>
              </div>
              <Checkbox
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences((p) => ({ ...p, marketing: checked === true }))}
              />
            </div>
          </div>

          <Button variant="gradient" className="w-full" onClick={() => save("personalizado", preferences)}>
            Salvar preferências
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
