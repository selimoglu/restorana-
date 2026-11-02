import { AutoRefresh } from "@/components/AutoRefresh";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { nextStatus, ORDER_TYPE } from "@/lib/orders";
import { OrderActions } from "../OrderActions";

export const dynamic = "force-dynamic";

// Mutfak tableti için sade, büyük yazılı ekran.
export default async function KitchenPage() {
  const user = await requireUser();
  const orders = await db.order.findMany({
    where: {
      restaurantId: user.restaurantId,
      status: { in: ["NEW", "ACCEPTED", "PREPARING"] },
      NOT: { paymentMethod: "ONLINE", paymentStatus: { in: ["PENDING", "FAILED"] } },
    },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
  const now = Date.now();
  const cols = [
    ["NEW", "Yeni"],
    ["ACCEPTED", "Onaylandı"],
    ["PREPARING", "Hazırlanıyor"],
  ] as const;

  return (
    <div>
      <AutoRefresh seconds={10} />
      <h1 className="mb-4 text-2xl font-bold">Mutfak ekranı</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        {cols.map(([status, label]) => (
          <section key={status} className="rounded-2xl bg-stone-100 p-3">
            <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wide text-stone-500">
              {label} ({orders.filter((o) => o.status === status).length})
            </h2>
            <div className="space-y-3">
              {orders
                .filter((o) => o.status === status)
                .map((o) => {
                  const mins = Math.floor((now - o.createdAt.getTime()) / 60000);
                  return (
                    <div key={o.id} className={`card ${mins > 25 ? "border-red-400" : ""}`}>
                      <div className="mb-2 flex justify-between">
                        <span className="text-2xl font-black">#{o.number}</span>
                        <span className={`text-sm font-semibold ${mins > 25 ? "text-red-600" : "text-stone-500"}`}>
                          {mins} dk · {ORDER_TYPE[o.type]}
                        </span>
                      </div>
                      <ul className="mb-3 space-y-1 text-lg">
                        {o.items.map((i) => (
                          <li key={i.id}>
                            <strong>{i.quantity}×</strong> {i.name}
                            {i.note && <span className="block text-sm text-red-700">{i.note}</span>}
                          </li>
                        ))}
                      </ul>
                      {o.note && <p className="mb-3 rounded bg-amber-100 p-2 text-sm font-medium">{o.note}</p>}
                      <OrderActions id={o.id} next={nextStatus(o.status, o.type)} canCancel={false} big />
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
