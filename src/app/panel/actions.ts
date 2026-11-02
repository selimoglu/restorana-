"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { aiEnabled, extractJson, generateText } from "@/lib/ai";
import { destroySession, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail, sendSms, sendWhatsapp } from "@/lib/messaging";
import { parseTl } from "@/lib/money";
import { completeOrder, nextStatus } from "@/lib/orders";
import { AUDIENCES } from "@/lib/campaigns";
import { importMenu, parseMenuText } from "@/lib/menu-import";

async function rid() {
  return (await requireUser()).restaurantId;
}

export async function logout() {
  await destroySession();
  redirect("/giris");
}

/* ---------- Siparişler ---------- */

export async function advanceOrder(orderId: string) {
  const restaurantId = await rid();
  const order = await db.order.findFirst({ where: { id: orderId, restaurantId }, include: { customer: true, restaurant: true } });
  if (!order) return;
  const next = nextStatus(order.status, order.type);
  if (!next) return;
  if (next === "COMPLETED") {
    await completeOrder(order.id);
  } else {
    await db.order.update({ where: { id: order.id }, data: { status: next } });
  }
  const msg: Record<string, string> = {
    ACCEPTED: `siparişiniz onaylandı, hazırlanmaya başlıyor.`,
    READY: `siparişiniz hazır! Gelip teslim alabilirsiniz.`,
    ON_THE_WAY: `siparişiniz yola çıktı. Afiyet olsun!`,
  };
  if (msg[next]) await sendSms(order.customer.phone, `${order.restaurant.name}: #${order.number} numaralı ${msg[next]}`);
  revalidatePath("/panel", "layout");
}

export async function cancelOrder(orderId: string) {
  const restaurantId = await rid();
  const order = await db.order.findFirst({ where: { id: orderId, restaurantId } });
  if (!order || order.status === "COMPLETED") return;
  await db.$transaction([
    db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }),
    // Kullanılan puanlar müşteriye iade edilir
    db.customer.update({ where: { id: order.customerId }, data: { points: { increment: order.pointsUsed } } }),
  ]);
  revalidatePath("/panel", "layout");
}

export async function markPaid(orderId: string) {
  const restaurantId = await rid();
  await db.order.updateMany({ where: { id: orderId, restaurantId }, data: { paymentStatus: "PAID" } });
  revalidatePath("/panel/siparisler");
}

export async function toggleOpen() {
  const restaurantId = await rid();
  const r = await db.restaurant.findUniqueOrThrow({ where: { id: restaurantId } });
  await db.restaurant.update({ where: { id: restaurantId }, data: { isOpen: !r.isOpen } });
  revalidatePath("/panel", "layout");
}

/* ---------- Menü ---------- */

export async function createCategory(form: FormData) {
  const restaurantId = await rid();
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  const count = await db.category.count({ where: { restaurantId } });
  await db.category.create({ data: { name, restaurantId, sort: count } });
  revalidatePath("/panel/menu");
}

export async function deleteCategory(id: string) {
  const restaurantId = await rid();
  await db.category.deleteMany({ where: { id, restaurantId } });
  revalidatePath("/panel/menu");
}

export async function saveItem(form: FormData) {
  const restaurantId = await rid();
  const id = String(form.get("id") ?? "");
  const categoryId = String(form.get("categoryId") ?? "");
  const cat = await db.category.findFirst({ where: { id: categoryId, restaurantId } });
  if (!cat) return;
  const data = {
    name: String(form.get("name") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    price: parseTl(String(form.get("price") ?? "0")),
    allergens: String(form.get("allergens") ?? "").trim(),
    imageUrl: String(form.get("imageUrl") ?? "").trim(),
    isPopular: form.get("isPopular") === "on",
    isUpsell: form.get("isUpsell") === "on",
    categoryId,
  };
  if (!data.name || data.price <= 0) return;
  if (id) {
    await db.menuItem.updateMany({ where: { id, restaurantId }, data });
  } else {
    const count = await db.menuItem.count({ where: { categoryId } });
    await db.menuItem.create({ data: { ...data, restaurantId, sort: count } });
  }
  revalidatePath("/panel/menu");
}

export async function toggleItem(id: string) {
  const restaurantId = await rid();
  const item = await db.menuItem.findFirst({ where: { id, restaurantId } });
  if (!item) return;
  await db.menuItem.update({ where: { id }, data: { isAvailable: !item.isAvailable } });
  revalidatePath("/panel/menu");
}

export async function deleteItem(id: string) {
  const restaurantId = await rid();
  await db.menuItem.deleteMany({ where: { id, restaurantId } });
  revalidatePath("/panel/menu");
}

export async function aiDescribeItem(name: string, current: string): Promise<string> {
  const user = await requireUser();
  if (!aiEnabled()) return `${name}: özenle seçilmiş malzemelerle, her gün taze hazırlanır.`;
  return generateText(
    `"${user.restaurant.name}" (${user.restaurant.cuisine || "restoran"}) için menüdeki "${name}" ürününe iştah açıcı, ` +
      `en fazla 120 karakterlik tek cümlelik bir açıklama yaz. Sadece açıklamayı döndür, tırnak kullanma.` +
      (current ? ` Mevcut açıklama: "${current}"` : ""),
  );
}

/** Serbest metin menüyü (ör. fotoğraftan kopyalanmış liste) kategorilere ve ürünlere ayırıp içe aktarır. */
export async function aiImportMenu(form: FormData) {
  const restaurantId = await rid();
  const text = String(form.get("menu") ?? "").slice(0, 20000);
  if (!text.trim()) return;
  const menu = await parseMenuText(text);
  await importMenu(restaurantId, menu);
  revalidatePath("/panel/menu");
}

/* ---------- Müşteriler & sadakat ---------- */

export async function adjustPoints(form: FormData) {
  const restaurantId = await rid();
  const id = String(form.get("id"));
  const delta = parseTl(String(form.get("delta") ?? "0"));
  const c = await db.customer.findFirst({ where: { id, restaurantId } });
  if (!c) return;
  await db.customer.update({ where: { id }, data: { points: Math.max(0, c.points + delta) } });
  revalidatePath("/panel/musteriler");
}

export async function createCoupon(form: FormData) {
  const restaurantId = await rid();
  const code = String(form.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!code) return;
  await db.coupon.upsert({
    where: { restaurantId_code: { restaurantId, code } },
    create: {
      restaurantId,
      code,
      percentOff: Number(form.get("percentOff") || 0),
      amountOff: parseTl(String(form.get("amountOff") || "0")),
      minOrder: parseTl(String(form.get("minOrder") || "0")),
    },
    update: { isActive: true },
  });
  revalidatePath("/panel/musteriler");
}

export async function toggleCoupon(id: string) {
  const restaurantId = await rid();
  const c = await db.coupon.findFirst({ where: { id, restaurantId } });
  if (c) await db.coupon.update({ where: { id }, data: { isActive: !c.isActive } });
  revalidatePath("/panel/musteriler");
}

/* ---------- Kampanyalar ---------- */

function audienceWhere(restaurantId: string, audience: string) {
  const base = { restaurantId, marketingConsent: true };
  switch (audience) {
    case "LAPSED":
      return { ...base, lastOrderAt: { lt: new Date(Date.now() - 14 * 86400000) } };
    case "VIP":
      return { ...base, orderCount: { gte: 5 } };
    case "NEW":
      return { ...base, orderCount: { lte: 1 } };
    default:
      return base;
  }
}

export async function audienceSize(audience: string) {
  const restaurantId = await rid();
  return db.customer.count({ where: audienceWhere(restaurantId, audience) });
}

export async function aiWriteCampaign(goal: string, channel: string, audience: string): Promise<string> {
  const user = await requireUser();
  const r = user.restaurant;
  if (!aiEnabled()) {
    return `{ad}, ${r.name}'dan selam! ${goal || "Bu hafta sana özel sürprizlerimiz var"}. Sipariş için: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/r/${r.slug}`;
  }
  const top = await db.orderItem.groupBy({
    by: ["name"],
    where: { order: { restaurantId: r.id } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const limits: Record<string, string> = {
    SMS: "en fazla 155 karakter, tek SMS'e sığmalı, emoji kullanma",
    EMAIL: "ilk satır 'Konu: ...' olsun, sonra 60-120 kelimelik samimi bir e-posta gövdesi",
    WHATSAPP: "en fazla 300 karakter, 1-2 emoji olabilir",
  };
  return generateText(
    `Restoran: ${r.name} (${r.cuisine}, ${r.district} ${r.city}). En çok satanlar: ${top.map((t) => t.name).join(", ")}.\n` +
      `Hedef kitle: ${AUDIENCES[audience] ?? audience}. Kanal: ${channel} (${limits[channel] ?? ""}).\n` +
      `Kampanya amacı: ${goal || "tekrar sipariş vermelerini sağlamak"}.\n` +
      `Müşterinin adı için {ad} yer tutucusunu kullan. Sonuna sipariş linki olarak {link} ekle. ` +
      `Var olmayan bir indirim kodu uydurma; amaçta kod geçiyorsa onu kullan. Sadece mesaj metnini döndür.`,
  );
}

export async function saveCampaign(form: FormData) {
  const restaurantId = await rid();
  const name = String(form.get("name") ?? "").trim() || "Kampanya";
  const channel = String(form.get("channel") ?? "SMS");
  const audience = String(form.get("audience") ?? "ALL");
  const message = String(form.get("message") ?? "").trim();
  const automation = String(form.get("automation") ?? "");
  if (!message) return;
  await db.campaign.create({
    data: { restaurantId, name, channel, audience, message, automation, status: automation ? "ACTIVE" : "DRAFT" },
  });
  revalidatePath("/panel/kampanyalar");
}

export async function sendCampaign(id: string) {
  const user = await requireUser();
  const r = user.restaurant;
  const c = await db.campaign.findFirst({ where: { id, restaurantId: r.id } });
  if (!c || c.status === "SENT") return;
  const customers = await db.customer.findMany({ where: audienceWhere(r.id, c.audience) });
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/r/${r.slug}`;
  let sent = 0;
  for (const cust of customers) {
    const text = c.message.replaceAll("{ad}", cust.name.split(" ")[0]).replaceAll("{link}", link);
    let ok = false;
    if (c.channel === "SMS") ok = await sendSms(cust.phone, text);
    else if (c.channel === "WHATSAPP") ok = await sendWhatsapp(cust.phone, text);
    else if (cust.email) {
      const [first, ...rest] = text.split("\n");
      const subject = first.replace(/^Konu:\s*/i, "");
      ok = await sendEmail(cust.email, subject, rest.join("\n").trim() || text);
    }
    if (ok) sent++;
  }
  await db.campaign.update({ where: { id }, data: { status: "SENT", sentAt: new Date(), sentCount: sent } });
  revalidatePath("/panel/kampanyalar");
}

export async function toggleAutomation(id: string) {
  const restaurantId = await rid();
  const c = await db.campaign.findFirst({ where: { id, restaurantId } });
  if (!c || !c.automation) return;
  await db.campaign.update({ where: { id }, data: { status: c.status === "ACTIVE" ? "DRAFT" : "ACTIVE" } });
  revalidatePath("/panel/kampanyalar");
}

export async function deleteCampaign(id: string) {
  const restaurantId = await rid();
  await db.campaign.deleteMany({ where: { id, restaurantId } });
  revalidatePath("/panel/kampanyalar");
}

/* ---------- Yorumlar ---------- */

export async function aiReplyReview(id: string): Promise<string> {
  const user = await requireUser();
  const rv = await db.review.findFirst({ where: { id, restaurantId: user.restaurantId } });
  if (!rv) return "";
  if (!aiEnabled()) {
    return rv.rating >= 4
      ? `Güzel yorumunuz için çok teşekkür ederiz ${rv.customerName}! Sizi yeniden ağırlamayı dört gözle bekliyoruz.`
      : `Yaşadığınız olumsuzluk için özür dileriz ${rv.customerName}. Geri bildiriminizi ekibimizle paylaştık; telefonla ulaşırsanız telafi etmek isteriz.`;
  }
  return generateText(
    `"${user.restaurant.name}" restoranı adına şu müşteri yorumuna kısa (en fazla 3 cümle), samimi ve profesyonel bir yanıt yaz. ` +
      `Olumsuzsa savunmaya geçme, özür dile ve telafi teklif et; olumluysa teşekkür et. Sadece yanıtı döndür.\n\n` +
      `Puan: ${rv.rating}/5\nMüşteri: ${rv.customerName}\nYorum: ${rv.comment}`,
  );
}

export async function saveReply(form: FormData) {
  const restaurantId = await rid();
  await db.review.updateMany({
    where: { id: String(form.get("id")), restaurantId },
    data: { reply: String(form.get("reply") ?? "").trim() },
  });
  revalidatePath("/panel/yorumlar");
}

/* ---------- Ayarlar ---------- */

export async function saveSettings(form: FormData) {
  const restaurantId = await rid();
  const s = (k: string) => String(form.get(k) ?? "").trim();
  const hours: Record<string, string> = {};
  for (const d of ["pzt", "sal", "car", "per", "cum", "cmt", "paz"]) {
    const v = s(`h_${d}`);
    if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(v)) hours[d] = v;
  }
  const color = s("primaryColor");
  await db.restaurant.update({
    where: { id: restaurantId },
    data: {
      name: s("name") || undefined,
      tagline: s("tagline"),
      about: s("about"),
      cuisine: s("cuisine"),
      phone: s("phone"),
      whatsapp: s("whatsapp").replace(/\D/g, ""),
      address: s("address"),
      district: s("district"),
      city: s("city") || "İstanbul",
      instagram: s("instagram").replace(/^@/, ""),
      googleReviewUrl: s("googleReviewUrl"),
      heroImageUrl: s("heroImageUrl"),
      primaryColor: /^#[0-9a-fA-F]{6}$/.test(color) ? color : undefined,
      openingHours: JSON.stringify(hours),
      pickupEnabled: form.get("pickupEnabled") === "on",
      deliveryEnabled: form.get("deliveryEnabled") === "on",
      cashOnDelivery: form.get("cashOnDelivery") === "on",
      cardOnDelivery: form.get("cardOnDelivery") === "on",
      onlinePayment: form.get("onlinePayment") === "on",
      deliveryFee: parseTl(s("deliveryFee")),
      freeDeliveryMin: parseTl(s("freeDeliveryMin")),
      minOrder: parseTl(s("minOrder")),
      prepMinutes: Number(s("prepMinutes")) || 20,
      loyaltyPercent: Math.min(30, Math.max(0, Number(s("loyaltyPercent")) || 0)),
    },
  });
  revalidatePath("/panel", "layout");
}

export async function aiWebsiteCopy(): Promise<{ tagline: string; about: string }> {
  const user = await requireUser();
  const r = user.restaurant;
  if (!aiEnabled()) {
    return {
      tagline: `${r.district || r.city}'in sevilen ${r.cuisine || "lezzet"} adresi`,
      about: `${r.name}, taze malzemeler ve özenli tariflerle misafirlerini ağırlıyor. Siparişinizi doğrudan bizden verin, hem daha hızlı ulaşsın hem de her siparişte puan kazanın.`,
    };
  }
  const items = await db.menuItem.findMany({ where: { restaurantId: r.id }, take: 15, select: { name: true } });
  const raw = await generateText(
    `Bir restoran web sitesi için Türkçe metin yaz. Restoran: ${r.name}, mutfak: ${r.cuisine}, konum: ${r.district} ${r.city}. ` +
      `Menüden örnekler: ${items.map((i) => i.name).join(", ")}. Mevcut tanıtım: ${r.about || "-"}.\n` +
      `JSON döndür: {"tagline":"en fazla 70 karakterlik slogan","about":"Google'da yerel aramalarda bulunmayı kolaylaştıran, ilçe ve mutfak türünü doğal biçimde geçiren 2-3 cümlelik hikâye"}`,
  );
  return extractJson<{ tagline: string; about: string }>(raw);
}

