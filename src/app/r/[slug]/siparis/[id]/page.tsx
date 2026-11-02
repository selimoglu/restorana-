import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AutoRefresh } from "@/components/AutoRefresh";
import { db } from "@/lib/db";
import { tl } from "@/lib/money";
import { ORDER_STATUS, ORDER_TYPE, PAYMENT_METHOD } from "@/lib/orders";
import { ReviewForm } from "./ReviewForm";

export const metadata: Metadata = { title: "Sipariş takibi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderStatusPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, restaurant: true, customer: true },
  });
  if (!order || order.restaurant.slug !== slug) notFound();
  const review = await db.review.findFirst({ where: { orderId: order.id } });

  const steps =
    order.type === "DELIVERY"
      ? ["NEW", "ACCEPTED", "PREPARING", "ON_THE_WAY", "COMPLETED"]
      : ["NEW", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];
  const current = steps.indexOf(order.status);
  const active = !["COMPLETED", "CANCELLED"].includes(order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {active && <AutoRefresh seconds={10} />}
      <p className="text-sm text-stone-500">Sipariş #{order.number}</p>
      <h1 className="mb-6 text-2xl font-bold">
        {order.status === "CANCELLED"
          ? order.paymentStatus === "FAILED"
            ? "Ödeme tamamlanamadı"
            : "Sipariş iptal edildi"
          : order.status === "COMPLETED"
            ? "Afiyet olsun!"
            : "Siparişiniz alındı"}
      </h1>

      {order.status !== "CANCELLED" && (
        <ol className="card mb-6 space-y-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= current ? "bg-brand text-white" : "bg-stone-200 text-stone-500"}`}
              >
                {i < current ? "✓" : i + 1}
              </span>
              <span className={i <= current ? "font-semibold" : "text-stone-500"}>{ORDER_STATUS[s].label}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="card space-y-2 text-sm">
        <p>
          <strong>{ORDER_TYPE[order.type]}</strong> · {PAYMENT_METHOD[order.paymentMethod]}
          {order.paymentStatus === "PAID" && " · Ödendi"}
        </p>
        {order.address && <p className="text-stone-600">{order.address}</p>}
        <div className="divide-y border-t pt-2">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between py-1.5">
              <span>
                {i.quantity} × {i.name}
              </span>
              <span>{tl(i.unitPrice * i.quantity)}</span>
            </div>
          ))}
        </div>
        {order.deliveryFee > 0 && <Row label="Teslimat" value={tl(order.deliveryFee)} />}
        {order.discount > 0 && <Row label="İndirim" value={`−${tl(order.discount)}`} />}
        {order.pointsUsed > 0 && <Row label="Kullanılan puan" value={`−${tl(order.pointsUsed)}`} />}
        <Row label="Toplam" value={tl(order.total)} bold />
      </div>

      {order.status === "COMPLETED" && (
        <div className="card mt-6">
          {order.pointsEarned > 0 && (
            <p className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">
              Bu siparişten {tl(order.pointsEarned)} puan kazandınız. Toplam puanınız: {tl(order.customer.points)}
            </p>
          )}
          {review ? (
            <div className="text-sm text-stone-600">
              <p>Değerlendirmeniz için teşekkürler!</p>
              {review.rating >= 4 && order.restaurant.googleReviewUrl && (
                <a href={order.restaurant.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3">
                  Google&apos;da da yorum yap
                </a>
              )}
            </div>
          ) : (
            <ReviewForm orderId={order.id} googleReviewUrl={order.restaurant.googleReviewUrl} />
          )}
        </div>
      )}

      {order.restaurant.phone && (
        <p className="mt-6 text-center text-sm text-stone-500">
          Sorunuz mu var?{" "}
          <a className="font-semibold text-brand" href={`tel:${order.restaurant.phone}`}>
            {order.restaurant.name}&apos;ı arayın
          </a>
        </p>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t pt-2 text-base font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
