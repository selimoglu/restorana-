import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { tl } from "@/lib/money";
import { formatTrPhone } from "@/lib/phone";
import { adjustPoints, createCoupon, toggleCoupon } from "../actions";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", year: "numeric" });

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const [customers, coupons] = await Promise.all([
    db.customer.findMany({
      where: {
        restaurantId: user.restaurantId,
        ...(q ? { OR: [{ name: { contains: q } }, { phone: { contains: q.replace(/\D/g, "") || q } }] } : {}),
      },
      orderBy: { totalSpent: "desc" },
      take: 200,
    }),
    db.coupon.findMany({ where: { restaurantId: user.restaurantId } }),
  ]);
  const consented = customers.filter((c) => c.marketingConsent).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Müşteriler & sadakat</h1>
          <p className="text-sm text-stone-500">
            {customers.length} müşteri · {consented} kişi ticari ileti onayı verdi · Puan oranı %{user.restaurant.loyaltyPercent}
          </p>
        </div>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Ad veya telefon ara" className="input" />
          <button className="btn-ghost">Ara</button>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="p-3">Müşteri</th>
              <th className="p-3">Sipariş</th>
              <th className="p-3">Toplam harcama</th>
              <th className="p-3">Son sipariş</th>
              <th className="p-3">Puan</th>
              <th className="p-3">İYS</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-3">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-stone-500">{formatTrPhone(c.phone)}</p>
                </td>
                <td className="p-3">{c.orderCount}</td>
                <td className="p-3">{tl(c.totalSpent)}</td>
                <td className="p-3">{c.lastOrderAt ? date.format(c.lastOrderAt) : "-"}</td>
                <td className="p-3">
                  <form action={adjustPoints} className="flex items-center gap-2">
                    <span className="w-20 font-semibold">{tl(c.points)}</span>
                    <input type="hidden" name="id" value={c.id} />
                    <input name="delta" className="input w-20 py-1" placeholder="±TL" aria-label="Puan ekle/çıkar" />
                    <button className="text-xs font-semibold text-brand">Uygula</button>
                  </form>
                </td>
                <td className="p-3">{c.marketingConsent ? "✓ Onaylı" : <span className="text-stone-400">Yok</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card">
        <h2 className="mb-3 font-semibold">İndirim kuponları</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {coupons.map((c) => (
            <form key={c.id} action={toggleCoupon.bind(null, c.id)}>
              <button className={`rounded-full border px-3 py-1 text-sm ${c.isActive ? "border-green-300 bg-green-50" : "border-stone-300 text-stone-400 line-through"}`}>
                {c.code} · {c.percentOff ? `%${c.percentOff}` : tl(c.amountOff)}
                {c.minOrder > 0 && ` (min ${tl(c.minOrder)})`}
              </button>
            </form>
          ))}
        </div>
        <form action={createCoupon} className="grid gap-3 sm:grid-cols-5">
          <input name="code" placeholder="KOD" className="input uppercase" required />
          <input name="percentOff" type="number" min={0} max={100} placeholder="% indirim" className="input" />
          <input name="amountOff" placeholder="veya TL indirim" className="input" />
          <input name="minOrder" placeholder="Min. sepet (TL)" className="input" />
          <button className="btn-dark">Kupon oluştur</button>
        </form>
      </section>
    </div>
  );
}
