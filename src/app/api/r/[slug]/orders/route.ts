import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sendSms } from "@/lib/messaging";
import { tl } from "@/lib/money";
import { createOrder, OrderError, orderInput } from "@/lib/orders";
import { iyzicoEnabled, initCheckoutForm } from "@/lib/payments/iyzico";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = orderInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz istek" }, { status: 400 });
  }

  let order;
  try {
    order = await createOrder(slug, parsed.data);
  } catch (e) {
    if (e instanceof OrderError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const statusPath = `/r/${slug}/siparis/${order.id}`;

  if (order.paymentMethod === "ONLINE") {
    if (!iyzicoEnabled()) {
      // Demo modu: iyzico anahtarı yokken ödeme başarılı sayılır.
      await db.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", paymentRef: "demo" } });
    } else {
      const h = await headers();
      const res = await initCheckoutForm({
        orderId: order.id,
        total: order.total,
        callbackUrl: `${appUrl}/api/odeme/iyzico?siparis=${order.id}`,
        buyer: {
          id: order.customerId,
          name: order.customer.name,
          phone: order.customer.phone,
          email: order.customer.email,
          address: order.address,
          city: order.restaurant.city,
          ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || "85.34.78.112",
        },
        // iyzico sepet satırları ödenen tutarla eşleşmeli: indirimler satırlara oransal dağıtılır.
        items: distribute(order.total, [
          ...order.items.map((i) => ({ id: i.id, name: i.name, price: i.unitPrice * i.quantity })),
          ...(order.deliveryFee ? [{ id: "teslimat", name: "Teslimat ücreti", price: order.deliveryFee }] : []),
        ]),
      });
      if (res.status !== "success" || !res.paymentPageUrl) {
        await db.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
        return Response.json({ error: res.errorMessage || "Ödeme başlatılamadı" }, { status: 502 });
      }
      await db.order.update({ where: { id: order.id }, data: { paymentRef: res.token ?? "" } });
      return Response.json({ redirect: res.paymentPageUrl });
    }
  }

  await sendSms(
    order.customer.phone,
    `${order.restaurant.name}: #${order.number} numaralı siparişiniz alındı. Toplam ${tl(order.total)}. Takip: ${appUrl}${statusPath}`,
  );
  return Response.json({ redirect: statusPath });
}

function distribute(total: number, items: { id: string; name: string; price: number }[]) {
  const sum = items.reduce((s, i) => s + i.price, 0);
  if (sum === total || sum === 0) return items;
  let left = total;
  return items
    .map((i, idx) => {
      const p = idx === items.length - 1 ? left : Math.round((i.price * total) / sum);
      left -= p;
      return { ...i, price: p };
    })
    .filter((i) => i.price > 0);
}
