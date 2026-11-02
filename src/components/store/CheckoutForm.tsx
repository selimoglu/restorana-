"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { tl } from "@/lib/money";
import { useCart } from "./cart";

interface Settings {
  pickup: boolean;
  delivery: boolean;
  deliveryFee: number;
  freeDeliveryMin: number;
  minOrder: number;
  cash: boolean;
  cardOnDelivery: boolean;
  online: boolean;
  loyaltyPercent: number;
  isOpen: boolean;
}

export function CheckoutForm({ slug, settings }: { slug: string; settings: Settings }) {
  const { lines, subtotal, setQty, clear } = useCart();
  const router = useRouter();
  const [type, setType] = useState<"PICKUP" | "DELIVERY">(settings.delivery ? "DELIVERY" : "PICKUP");
  const [payment, setPayment] = useState<"ONLINE" | "CASH" | "CARD_ON_DELIVERY">(settings.online ? "ONLINE" : "CARD_ON_DELIVERY");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const deliveryFee =
    type === "DELIVERY" && !(settings.freeDeliveryMin > 0 && subtotal >= settings.freeDeliveryMin) ? settings.deliveryFee : 0;

  if (lines.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-stone-600">Sepetiniz boş.</p>
        <Link href={`/r/${slug}#menu`} className="btn-primary mt-4">
          Menüye dön
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/r/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          paymentMethod: payment,
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email") || "",
          address: f.get("address") || "",
          note: f.get("note") || "",
          couponCode: f.get("coupon") || "",
          usePoints: f.get("usePoints") === "on",
          kvkk: f.get("kvkk") === "on",
          marketingConsent: f.get("marketing") === "on",
          items: lines.map((l) => ({ id: l.id, quantity: l.quantity, note: l.note })),
        }),
      });
      const data = (await res.json()) as { error?: string; redirect?: string };
      if (!res.ok || !data.redirect) throw new Error(data.error || "Sipariş oluşturulamadı");
      clear();
      if (data.redirect.startsWith("http")) window.location.href = data.redirect;
      else router.push(data.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setBusy(false);
    }
  }

  const choice = (active: boolean) =>
    `flex-1 rounded-xl border px-4 py-3 text-left text-sm font-medium ${active ? "border-brand bg-brand/5 ring-2 ring-brand/30" : "border-stone-300 bg-white"}`;

  return (
    <form onSubmit={submit} className="space-y-6">
      {!settings.isOpen && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Restoran şu an sipariş almıyor.</p>
      )}
      <section className="card space-y-3">
        <h2 className="font-semibold">Sepet</h2>
        {lines.map((l) => (
          <div key={l.id} className="flex items-center justify-between text-sm">
            <span>
              {l.quantity} × {l.name}
            </span>
            <span className="flex items-center gap-3">
              {tl(l.price * l.quantity)}
              <button type="button" className="text-stone-400 hover:text-red-600" onClick={() => setQty(l.id, 0)} aria-label="Kaldır">
                ×
              </button>
            </span>
          </div>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Teslimat şekli</h2>
        <div className="flex gap-3">
          {settings.delivery && (
            <button type="button" className={choice(type === "DELIVERY")} onClick={() => setType("DELIVERY")}>
              Paket servis
              <span className="block text-xs font-normal text-stone-500">
                {settings.deliveryFee ? `${tl(settings.deliveryFee)} teslimat` : "Ücretsiz teslimat"}
                {settings.freeDeliveryMin > 0 && ` · ${tl(settings.freeDeliveryMin)} üzeri ücretsiz`}
              </span>
            </button>
          )}
          {settings.pickup && (
            <button type="button" className={choice(type === "PICKUP")} onClick={() => setType("PICKUP")}>
              Gel-al
              <span className="block text-xs font-normal text-stone-500">Sıra beklemeden teslim al</span>
            </button>
          )}
        </div>
        {type === "DELIVERY" && (
          <div>
            <label className="label" htmlFor="address">
              Açık adres
            </label>
            <textarea id="address" name="address" required minLength={10} rows={3} className="input" placeholder="Mahalle, cadde/sokak, bina no, daire no, tarif" />
          </div>
        )}
      </section>

      <section className="card grid gap-3 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">İletişim bilgileri</h2>
        <div>
          <label className="label" htmlFor="name">Ad soyad</label>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Cep telefonu</label>
          <input id="phone" name="phone" required className="input" inputMode="tel" placeholder="05xx xxx xx xx" autoComplete="tel" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="email">E-posta (isteğe bağlı)</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="note">Sipariş notu</label>
          <input id="note" name="note" className="input" placeholder="Ör. soğansız olsun, zile basmayın" />
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Ödeme</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          {settings.online && (
            <button type="button" className={choice(payment === "ONLINE")} onClick={() => setPayment("ONLINE")}>
              Online kart ile öde
              <span className="block text-xs font-normal text-stone-500">iyzico güvencesiyle</span>
            </button>
          )}
          {settings.cardOnDelivery && (
            <button type="button" className={choice(payment === "CARD_ON_DELIVERY")} onClick={() => setPayment("CARD_ON_DELIVERY")}>
              Kapıda kart
            </button>
          )}
          {settings.cash && (
            <button type="button" className={choice(payment === "CASH")} onClick={() => setPayment("CASH")}>
              Kapıda nakit
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="coupon">İndirim kodu</label>
            <input id="coupon" name="coupon" className="input uppercase" placeholder="HOSGELDIN" />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="usePoints" className="h-4 w-4" /> Puanlarımı kullan (varsa)
          </label>
        </div>
      </section>

      <section className="card space-y-2 text-sm">
        <div className="flex justify-between"><span>Ara toplam</span><span>{tl(subtotal)}</span></div>
        <div className="flex justify-between"><span>Teslimat</span><span>{deliveryFee ? tl(deliveryFee) : "Ücretsiz"}</span></div>
        <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Toplam</span><span>{tl(subtotal + deliveryFee)}</span></div>
        <p className="text-xs text-stone-500">İndirim ve puanlar bir sonraki adımda düşülür. Bu siparişten yaklaşık {tl(Math.floor((subtotal * settings.loyaltyPercent) / 100))} puan kazanırsınız.</p>
      </section>

      <div className="space-y-2 text-sm">
        <label className="flex items-start gap-2">
          <input type="checkbox" name="kvkk" required className="mt-1 h-4 w-4" />
          <span>
            Kişisel verilerimin siparişimin hazırlanması ve teslimi için işlenmesine ilişkin{" "}
            <Link href="/kvkk" target="_blank" className="underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum.
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="marketing" className="mt-1 h-4 w-4" />
          <span>Kampanya ve indirimlerden SMS / e-posta ile haberdar olmak istiyorum (ticari elektronik ileti onayı, İYS).</span>
        </label>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy || !settings.isOpen || subtotal < settings.minOrder} className="btn-primary w-full py-3.5 text-base">
        {busy ? "Gönderiliyor…" : payment === "ONLINE" ? "Ödemeye geç" : "Siparişi gönder"}
      </button>
    </form>
  );
}
