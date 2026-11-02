import { AutoRefresh } from "@/components/AutoRefresh";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { tl } from "@/lib/money";
import { formatTrPhone } from "@/lib/phone";
import { nextStatus, ORDER_STATUS, ORDER_TYPE, PAYMENT_METHOD } from "@/lib/orders";
import { OrderActions } from "../OrderActions";
import { toggleOpen } from "../actions";

export const dynamic = "force-dynamic";

const time = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const user = await requireUser();
  const { durum } = await searchParams;
  const showAll = durum === "tumu";
  const orders = await db.order.findMany({
    where: {
      restaurantId: user.restaurantId,
      ...(showAll ? {} : { status: { in: ["NEW", "ACCEPTED", "PREPARING", "READY", "ON_THE_WAY"] } }),
      NOT: { paymentMethod: "ONLINE", paymentStatus: { in: ["PENDING", "FAILED"] } },
    },
    include: { items: true, customer: true },
    orderBy: { createdAt: "desc" },
    take: showAll ? 100 : 50,
  });

  return (
    <div>
      <AutoRefresh seconds={15} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Siparişler</h1>
        <div className="flex gap-2">
          <a href="/panel/siparisler" className={showAll ? "btn-ghost" : "btn-dark"}>Açık</a>
          <a href="/panel/siparisler?durum=tumu" className={showAll ? "btn-dark" : "btn-ghost"}>Tümü</a>
          <form action={toggleOpen}>
            <button className={user.restaurant.isOpen ? "btn-ghost text-green-700" : "btn-ghost text-red-700"}>
              {user.restaurant.isOpen ? "● Sipariş alıyor" : "● Siparişe kapalı"}
            </button>
          </form>
        </div>
      </div>
      {orders.length === 0 && <p className="card text-stone-500">Şu an açık sipariş yok. Yeni siparişler burada otomatik görünür.</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {orders.map((o) => (
          <div key={o.id} className={`card ${o.status === "NEW" ? "border-red-300 ring-2 ring-red-100" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">
                  #{o.number} · {o.customer.name}
                </p>
                <p className="text-sm text-stone-500">
                  {time.format(o.createdAt)} · {ORDER_TYPE[o.type]} · <a href={`tel:+${o.customer.phone}`}>{formatTrPhone(o.customer.phone)}</a>
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span>
            </div>
            <ul className="my-3 space-y-1 text-sm">
              {o.items.map((i) => (
                <li key={i.id}>
                  <strong>{i.quantity}×</strong> {i.name}
                  {i.note && <span className="text-stone-500"> — {i.note}</span>}
                </li>
              ))}
            </ul>
            {o.note && <p className="mb-2 rounded-lg bg-amber-50 p-2 text-sm">Not: {o.note}</p>}
            {o.address && <p className="mb-2 text-sm text-stone-600">📍 {o.address}</p>}
            <p className="mb-3 text-sm">
              <strong>{tl(o.total)}</strong> · {PAYMENT_METHOD[o.paymentMethod]} ·{" "}
              {o.paymentStatus === "PAID" ? <span className="text-green-700">Ödendi</span> : <span className="text-amber-700">Ödeme kapıda</span>}
            </p>
            <OrderActions
              id={o.id}
              next={nextStatus(o.status, o.type)}
              canCancel={!["COMPLETED", "CANCELLED"].includes(o.status)}
              unpaid={o.paymentStatus !== "PAID" && o.status !== "CANCELLED"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
