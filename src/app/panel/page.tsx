import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { tl } from "@/lib/money";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  // İstanbul UTC+3 (yaz saati yok)
  const t = new Date(d.getTime() + 3 * 3600000);
  t.setUTCHours(0, 0, 0, 0);
  return new Date(t.getTime() - 3 * 3600000);
}

export default async function Dashboard() {
  const user = await requireUser();
  const rid = user.restaurantId;
  const today = startOfDay(new Date());
  const since = new Date(today.getTime() - 13 * 86400000);

  const [orders, openCount, customers, lapsed, reviews] = await Promise.all([
    db.order.findMany({ where: { restaurantId: rid, createdAt: { gte: since }, status: { not: "CANCELLED" } }, select: { total: true, createdAt: true, customerId: true } }),
    db.order.count({ where: { restaurantId: rid, status: { in: ["NEW", "ACCEPTED", "PREPARING", "READY", "ON_THE_WAY"] } } }),
    db.customer.count({ where: { restaurantId: rid } }),
    db.customer.count({ where: { restaurantId: rid, lastOrderAt: { lt: new Date(Date.now() - 14 * 86400000) } } }),
    db.review.aggregate({ where: { restaurantId: rid }, _avg: { rating: true }, _count: true }),
  ]);

  const days = Array.from({ length: 14 }, (_, i) => {
    const start = new Date(since.getTime() + i * 86400000);
    const end = new Date(start.getTime() + 86400000);
    const list = orders.filter((o) => o.createdAt >= start && o.createdAt < end);
    return {
      label: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" }).format(start),
      revenue: list.reduce((s, o) => s + o.total, 0),
      count: list.length,
    };
  });
  const todayStats = days[days.length - 1];
  const total14 = days.reduce((s, d) => s + d.revenue, 0);
  const max = Math.max(1, ...days.map((d) => d.revenue));
  // Aracı platformlarda tipik %20-30 komisyon: ortalama %25 ile tasarruf tahmini
  const saved = Math.round(total14 * 0.25);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Merhaba, {user.name.split(" ")[0]}</h1>
          <p className="text-stone-500">{user.restaurant.name} için bugünün özeti</p>
        </div>
        {openCount > 0 && (
          <Link href="/panel/siparisler" className="btn-primary">
            {openCount} açık sipariş →
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Bugünkü ciro" value={tl(todayStats.revenue)} sub={`${todayStats.count} sipariş`} />
        <Stat label="Son 14 gün ciro" value={tl(total14)} sub={`${orders.length} sipariş`} />
        <Stat label="Komisyondan tasarruf (tahmini)" value={tl(saved)} sub="Aracı platformlara göre, son 14 gün" />
        <Stat
          label="Müşteriler"
          value={String(customers)}
          sub={`${lapsed} kişi 14+ gündür sipariş vermedi`}
        />
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">Günlük ciro (son 14 gün)</h2>
        <div className="flex h-48 items-end gap-1.5" role="img" aria-label="Günlük ciro grafiği">
          {days.map((d) => (
            <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.label}: ${tl(d.revenue)} (${d.count} sipariş)`}>
              <div className="w-full flex-none rounded-t bg-brand/80 transition group-hover:bg-brand" style={{ height: `${(d.revenue / max) * 100}%`, minHeight: d.revenue ? 4 : 0 }} />
              <span className="hidden text-[10px] text-stone-500 sm:block">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Tip title="Geri kazanma kampanyası" href="/panel/kampanyalar">
          {lapsed} müşteri bir süredir sipariş vermedi. AI ile kişiselleştirilmiş bir SMS hazırlayın.
        </Tip>
        <Tip title="Yorum puanınız" href="/panel/yorumlar">
          Ortalama {reviews._avg.rating?.toFixed(1) ?? "-"} / 5 ({reviews._count} yorum). Cevaplanmamış yorumlara AI ile yanıt yazın.
        </Tip>
        <Tip title="AI asistana sorun" href="/panel/asistan">
          “Bu hafta en çok ne sattı?”, “Hangi ürünü kampanyaya koymalıyım?” gibi sorular sorun.
        </Tip>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{sub}</p>
    </div>
  );
}

function Tip({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="card block hover:border-stone-400">
      <p className="font-semibold">{title} →</p>
      <p className="mt-1 text-sm text-stone-600">{children}</p>
    </Link>
  );
}
