import { z } from "zod";
import { db } from "./db";
import { normalizeTrPhone } from "./phone";
import { runFirstOrderAutomation } from "./automations";

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  NEW: { label: "Yeni", color: "bg-red-100 text-red-800" },
  ACCEPTED: { label: "Onaylandı", color: "bg-amber-100 text-amber-800" },
  PREPARING: { label: "Hazırlanıyor", color: "bg-yellow-100 text-yellow-800" },
  READY: { label: "Hazır", color: "bg-lime-100 text-lime-800" },
  ON_THE_WAY: { label: "Yolda", color: "bg-sky-100 text-sky-800" },
  COMPLETED: { label: "Teslim edildi", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "İptal", color: "bg-stone-200 text-stone-700" },
};

export const ORDER_TYPE: Record<string, string> = {
  PICKUP: "Gel-al",
  DELIVERY: "Paket servis",
  CATERING: "Toplu sipariş",
};

export const PAYMENT_METHOD: Record<string, string> = {
  ONLINE: "Online kart",
  CASH: "Kapıda nakit",
  CARD_ON_DELIVERY: "Kapıda kart",
};

/** Bir sonraki adım: panelde tek tuşla ilerletmek için. */
export function nextStatus(status: string, type: string): string | null {
  const flow =
    type === "DELIVERY"
      ? ["NEW", "ACCEPTED", "PREPARING", "ON_THE_WAY", "COMPLETED"]
      : ["NEW", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];
  const i = flow.indexOf(status);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
}

export const orderInput = z.object({
  type: z.enum(["PICKUP", "DELIVERY", "CATERING"]),
  paymentMethod: z.enum(["ONLINE", "CASH", "CARD_ON_DELIVERY"]),
  name: z.string().trim().min(2, "Ad soyad gerekli").max(80),
  phone: z.string().trim(),
  email: z.string().trim().email().or(z.literal("")).default(""),
  address: z.string().trim().max(400).default(""),
  note: z.string().trim().max(400).default(""),
  couponCode: z.string().trim().max(40).default(""),
  usePoints: z.boolean().default(false),
  scheduledFor: z.string().optional(),
  kvkk: z.literal(true, { message: "KVKK aydınlatma metnini onaylamalısınız" }),
  marketingConsent: z.boolean().default(false),
  items: z
    .array(z.object({ id: z.string(), quantity: z.number().int().min(1).max(50), note: z.string().max(200).default("") }))
    .min(1, "Sepet boş"),
});

export type OrderInput = z.infer<typeof orderInput>;

export class OrderError extends Error {}

/** Fiyatları her zaman veritabanından hesaplar; istemciden gelen fiyata güvenmez. */
export async function createOrder(slug: string, input: OrderInput) {
  const r = await db.restaurant.findUnique({ where: { slug }, include: { items: true } });
  if (!r) throw new OrderError("Restoran bulunamadı");
  if (!r.isOpen) throw new OrderError("Restoran şu anda sipariş almıyor");
  if (input.type === "DELIVERY" && !r.deliveryEnabled) throw new OrderError("Paket servis kapalı");
  if (input.type === "PICKUP" && !r.pickupEnabled) throw new OrderError("Gel-al kapalı");
  if (input.type === "DELIVERY" && input.address.length < 10) throw new OrderError("Teslimat adresi gerekli");
  if (input.paymentMethod === "CASH" && !r.cashOnDelivery) throw new OrderError("Nakit ödeme kapalı");
  if (input.paymentMethod === "CARD_ON_DELIVERY" && !r.cardOnDelivery) throw new OrderError("Kapıda kart kapalı");
  if (input.paymentMethod === "ONLINE" && !r.onlinePayment) throw new OrderError("Online ödeme kapalı");

  const phone = normalizeTrPhone(input.phone);
  if (!phone) throw new OrderError("Geçerli bir cep telefonu girin (05xx...)");

  const lines = input.items.map((line) => {
    const item = r.items.find((i) => i.id === line.id);
    if (!item || !item.isAvailable) throw new OrderError("Sepetteki bir ürün artık mevcut değil");
    return { item, quantity: line.quantity, note: line.note };
  });
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.quantity, 0);
  if (subtotal < r.minOrder) throw new OrderError("Minimum sipariş tutarının altında");

  const deliveryFee =
    input.type === "DELIVERY" && !(r.freeDeliveryMin > 0 && subtotal >= r.freeDeliveryMin) ? r.deliveryFee : 0;

  let discount = 0;
  if (input.couponCode) {
    const c = await db.coupon.findUnique({
      where: { restaurantId_code: { restaurantId: r.id, code: input.couponCode.toUpperCase() } },
    });
    if (!c || !c.isActive) throw new OrderError("Kupon geçersiz");
    if (subtotal < c.minOrder) throw new OrderError("Kupon için sepet tutarı yetersiz");
    discount = Math.min(subtotal, c.amountOff + Math.round((subtotal * c.percentOff) / 100));
  }

  const existing = await db.customer.findUnique({ where: { restaurantId_phone: { restaurantId: r.id, phone } } });
  const pointsUsed = input.usePoints && existing ? Math.min(existing.points, subtotal - discount) : 0;
  const total = subtotal - discount - pointsUsed + deliveryFee;

  return db.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { restaurantId_phone: { restaurantId: r.id, phone } },
      create: {
        restaurantId: r.id,
        phone,
        name: input.name,
        email: input.email,
        marketingConsent: input.marketingConsent,
        kvkkConsentAt: new Date(),
      },
      update: {
        name: input.name,
        email: input.email || undefined,
        kvkkConsentAt: new Date(),
        ...(input.marketingConsent ? { marketingConsent: true } : {}),
        points: { decrement: pointsUsed },
      },
    });
    const last = await tx.order.findFirst({ where: { restaurantId: r.id }, orderBy: { number: "desc" } });
    return tx.order.create({
      data: {
        restaurantId: r.id,
        customerId: customer.id,
        number: (last?.number ?? 1000) + 1,
        type: input.type,
        paymentMethod: input.paymentMethod,
        subtotal,
        deliveryFee,
        discount,
        pointsUsed,
        total,
        address: input.type === "DELIVERY" ? input.address : "",
        note: input.note,
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
        items: {
          create: lines.map((l) => ({
            menuItemId: l.item.id,
            name: l.item.name,
            unitPrice: l.item.price,
            quantity: l.quantity,
            note: l.note,
          })),
        },
      },
      include: { items: true, customer: true, restaurant: true },
    });
  });
}

/** Sipariş teslim edilince sadakat puanı ve müşteri istatistikleri güncellenir. */
export async function completeOrder(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { restaurant: true } });
  if (!order || order.status === "COMPLETED") return;
  const earned = Math.floor(((order.subtotal - order.discount - order.pointsUsed) * order.restaurant.loyaltyPercent) / 100);
  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "COMPLETED", pointsEarned: earned } }),
    db.customer.update({
      where: { id: order.customerId },
      data: {
        points: { increment: earned },
        orderCount: { increment: 1 },
        totalSpent: { increment: order.total },
        lastOrderAt: new Date(),
      },
    }),
  ]);
  await runFirstOrderAutomation(order.customerId);
}
