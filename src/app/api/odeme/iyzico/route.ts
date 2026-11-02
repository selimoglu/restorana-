import { db } from "@/lib/db";
import { sendSms } from "@/lib/messaging";
import { tl } from "@/lib/money";
import { retrieveCheckoutForm } from "@/lib/payments/iyzico";

// iyzico ödeme sonrası müşteriyi bu adrese POST ile yönlendirir (form alanı: token).
export async function POST(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("siparis") ?? "";
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const order = await db.order.findUnique({ where: { id: orderId }, include: { restaurant: true, customer: true } });
  if (!order) return new Response("Sipariş bulunamadı", { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const statusUrl = `${appUrl}/r/${order.restaurant.slug}/siparis/${order.id}`;

  if (order.paymentStatus !== "PAID") {
    const result = token ? await retrieveCheckoutForm(token) : null;
    const ok = result?.status === "success" && result.paymentStatus === "SUCCESS" && result.basketId === order.id;
    await db.order.update({
      where: { id: order.id },
      data: ok
        ? { paymentStatus: "PAID", paymentRef: result?.paymentId ?? token }
        : { paymentStatus: "FAILED", status: "CANCELLED" },
    });
    if (ok) {
      await sendSms(
        order.customer.phone,
        `${order.restaurant.name}: #${order.number} numaralı siparişiniz alındı, ödemeniz onaylandı (${tl(order.total)}). Takip: ${statusUrl}`,
      );
    }
  }
  return Response.redirect(statusUrl, 303);
}
