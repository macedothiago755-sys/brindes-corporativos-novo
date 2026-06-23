"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** "center" = janela flutuante; "right" = drawer lateral. */
  variant?: "center" | "right";
}

export function Modal({ open, onClose, title, children, variant = "center" }: ModalProps) {
  if (!open) return null;

  const panel =
    variant === "right"
      ? "ml-auto h-full w-full max-w-md animate-[slideIn_0.2s_ease-out]"
      : "m-auto w-full max-w-lg rounded-xl";

  return (
    <div
      className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`flex flex-col bg-white shadow-xl ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
