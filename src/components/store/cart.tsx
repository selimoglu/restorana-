"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
}

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (item: { id: string; name: string; price: number }, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const key = `sepet:${slug}`;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(lines));
    } catch {}
  }, [key, lines]);

  const add = useCallback((item: { id: string; name: string; price: number }, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === item.id);
      if (found) return prev.map((l) => (l.id === item.id ? { ...l, quantity: l.quantity + qty } : l));
      return [...prev, { ...item, quantity: qty, note: "" }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, quantity: qty } : l))));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.quantity * l.price, 0),
      add,
      setQty,
      clear,
      open,
      setOpen,
    }),
    [lines, add, setQty, clear, open],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart CartProvider içinde kullanılmalı");
  return c;
}
