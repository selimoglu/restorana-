"use client";

import Link from "next/link";
import { tl } from "@/lib/money";
import { useCart } from "./cart";

interface Upsell {
  id: string;
  name: string;
  price: number;
}

export function CartDrawer({ slug, upsells, minOrder }: { slug: string; upsells: Upsell[]; minOrder: number }) {
  const { lines, count, subtotal, setQty, add, open, setOpen } = useCart();
  const suggestions = upsells.filter((u) => !lines.some((l) => l.id === u.id)).slice(0, 3);
  const belowMin = subtotal < minOrder;

  return (
    <>
      {count > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="btn-primary fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 py-3.5 text-base shadow-lg"
        >
          Sepeti gör ({count}) · {tl(subtotal)}
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={() => setOpen(false)}>
          <aside
            className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            aria-label="Sepet"
          >
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold">Sepetiniz</h2>
              <button onClick={() => setOpen(false)} className="text-2xl leading-none text-stone-500" aria-label="Kapat">
                ×
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {lines.length === 0 && <p className="text-stone-500">Sepetiniz boş.</p>}
              {lines.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="text-sm text-stone-500">{tl(l.price * l.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-ghost h-8 w-8 p-0" onClick={() => setQty(l.id, l.quantity - 1)} aria-label="Azalt">
                      −
                    </button>
                    <span className="w-5 text-center">{l.quantity}</span>
                    <button className="btn-ghost h-8 w-8 p-0" onClick={() => setQty(l.id, l.quantity + 1)} aria-label="Artır">
                      +
                    </button>
                  </div>
                </div>
              ))}
              {suggestions.length > 0 && lines.length > 0 && (
                <div className="mt-6 rounded-xl bg-stone-50 p-3">
                  <p className="mb-2 text-sm font-semibold">Yanına iyi gider</p>
                  <div className="space-y-2">
                    {suggestions.map((u) => (
                      <div key={u.id} className="flex items-center justify-between text-sm">
                        <span>
                          {u.name} <span className="text-stone-500">· {tl(u.price)}</span>
                        </span>
                        <button className="font-semibold text-brand" onClick={() => add(u)}>
                          + Ekle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t p-4">
              <div className="mb-3 flex justify-between font-semibold">
                <span>Ara toplam</span>
                <span>{tl(subtotal)}</span>
              </div>
              {belowMin && lines.length > 0 && (
                <p className="mb-2 text-sm text-amber-700">Minimum sipariş tutarı {tl(minOrder)}.</p>
              )}
              <Link
                href={`/r/${slug}/siparis`}
                onClick={() => setOpen(false)}
                className={`btn-primary w-full py-3 ${lines.length === 0 || belowMin ? "pointer-events-none opacity-50" : ""}`}
              >
                Siparişi tamamla
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
