"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

/**
 * Carrinho de Cotações Multi-Item.
 *
 * Permite ao comprador B2B acumular vários produtos e fechar uma única cotação
 * global, em vez de um orçamento por produto.
 *
 * NOTA DE ARQUITETURA — logotipo anexado:
 * `File`/`Blob` NÃO são serializáveis e não sobrevivem a um reload/fechamento
 * de aba via localStorage. Por isso, quando o cliente anexa um logo a um item,
 * fazemos o upload imediato (POST /api/upload) e persistimos apenas a URL
 * pública resultante (`logoUrl`). Assim o anexo realmente sobrevive ao refresh,
 * que é justamente o requisito de "não perder os itens montados".
 */

export interface QuoteCartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Preço unitário de referência (pode ser nulo se não cadastrado). */
  unitPrice: number | null;
  /** Faixa de preço cadastrada no produto, para exibir a tendência ao mudar qtd. */
  priceTier: "ENTRADA" | "MEDIO" | "ALTO" | null;
  quantity: number;
  customizationText?: string;
  /** URL pública do logo já enviado para /api/upload (persistível). */
  logoUrl?: string;
  logoFilename?: string;
  /** Método de personalização escolhido para este item (obrigatório ao adicionar). */
  customizationMethod?: string;
}

interface QuoteCartState {
  items: QuoteCartItem[];
  hydrated: boolean;
}

type Action =
  | { type: "HYDRATE"; items: QuoteCartItem[] }
  | { type: "ADD"; item: QuoteCartItem }
  | { type: "REMOVE"; productId: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number }
  | { type: "UPDATE_ITEM"; productId: string; patch: Partial<QuoteCartItem> }
  | { type: "CLEAR" };

const STORAGE_KEY = "brindes:quote-cart";
const MIN_QTY = 1;
const MAX_QTY = 1_000_000;

function clampQty(q: number): number {
  if (!Number.isFinite(q)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.round(q)));
}

function reducer(state: QuoteCartState, action: Action): QuoteCartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, hydrated: true };
    case "ADD": {
      const item = { ...action.item, quantity: clampQty(action.item.quantity) };
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        // Reentrar com o mesmo produto soma a quantidade e atualiza os detalhes.
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, ...item, quantity: clampQty(i.quantity + item.quantity) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, item] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, quantity: clampQty(action.quantity) } : i
        ),
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, ...action.patch } : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface QuoteCartContextValue {
  items: QuoteCartItem[];
  hydrated: boolean;
  count: number;
  totalEstimate: number | null;
  addItem: (item: QuoteCartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItem: (productId: string, patch: Partial<QuoteCartItem>) => void;
  clear: () => void;
  hasItem: (productId: string) => boolean;
}

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });

  // Hidrata a partir do localStorage uma única vez no cliente.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const items = Array.isArray(parsed) ? (parsed as QuoteCartItem[]) : [];
      dispatch({ type: "HYDRATE", items });
    } catch {
      dispatch({ type: "HYDRATE", items: [] });
    }
  }, []);

  // Persiste a cada mudança (somente depois de hidratar, para não sobrescrever).
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // quota cheia / modo privado: ignora silenciosamente
    }
  }, [state.items, state.hydrated]);

  // Sincroniza entre abas abertas do mesmo navegador.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed: unknown = e.newValue ? JSON.parse(e.newValue) : [];
        dispatch({ type: "HYDRATE", items: Array.isArray(parsed) ? (parsed as QuoteCartItem[]) : [] });
      } catch {
        /* ignora */
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<QuoteCartContextValue>(() => {
    const count = state.items.length;
    const priced = state.items.filter((i) => i.unitPrice != null);
    const totalEstimate = priced.length
      ? priced.reduce((acc, i) => acc + (i.unitPrice ?? 0) * i.quantity, 0)
      : null;
    return {
      items: state.items,
      hydrated: state.hydrated,
      count,
      totalEstimate,
      addItem: (item) => dispatch({ type: "ADD", item }),
      removeItem: (productId) => dispatch({ type: "REMOVE", productId }),
      updateQuantity: (productId, quantity) => dispatch({ type: "UPDATE_QTY", productId, quantity }),
      updateItem: (productId, patch) => dispatch({ type: "UPDATE_ITEM", productId, patch }),
      clear: () => dispatch({ type: "CLEAR" }),
      hasItem: (productId) => state.items.some((i) => i.productId === productId),
    };
  }, [state.items, state.hydrated]);

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
}

export function useQuoteCart(): QuoteCartContextValue {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error("useQuoteCart deve ser usado dentro de <QuoteCartProvider>.");
  return ctx;
}
