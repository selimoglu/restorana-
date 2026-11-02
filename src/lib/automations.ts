import { db } from "./db";
import { sendEmail, sendSms, sendWhatsapp } from "./messaging";

async function deliver(channel: string, c: { name: string; phone: string; email: string }, template: string, slug: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/r/${slug}`;
  const text = template.replaceAll("{ad}", c.name.split(" ")[0]).replaceAll("{link}", link);
  if (channel === "SMS") return sendSms(c.phone, text);
  if (channel === "WHATSAPP") return sendWhatsapp(c.phone, text);
  if (!c.email) return false;
  const [first, ...rest] = text.split("\n");
  return sendEmail(c.email, first.replace(/^Konu:\s*/i, ""), rest.join("\n").trim() || text);
}

/** İlk sipariş teslim edildiğinde aktif "ilk sipariş teşekkürü" otomasyonlarını çalıştırır. */
export async function runFirstOrderAutomation(customerId: string) {
  const c = await db.customer.findUnique({ where: { id: customerId }, include: { restaurant: true } });
  if (!c || c.orderCount !== 1 || !c.marketingConsent) return;
  const list = await db.campaign.findMany({
    where: { restaurantId: c.restaurantId, automation: "FIRST_ORDER_THANKS", status: "ACTIVE" },
  });
  for (const camp of list) {
    if (await deliver(camp.channel, c, camp.message, c.restaurant.slug)) {
      await db.campaign.update({ where: { id: camp.id }, data: { sentCount: { increment: 1 } } });
    }
  }
}

/**
 * Günlük çalışır: tam 14 gün önce son siparişini vermiş, izinli müşterilere "seni özledik" mesajı gider.
 * Günlük pencere sayesinde her müşteri bir dönemde yalnızca bir kez mesaj alır.
 */
export async function runWinBackAutomations(now = new Date()) {
  const from = new Date(now.getTime() - 15 * 86400000);
  const to = new Date(now.getTime() - 14 * 86400000);
  const list = await db.campaign.findMany({
    where: { automation: "WIN_BACK", status: "ACTIVE" },
    include: { restaurant: true },
  });
  let sent = 0;
  for (const camp of list) {
    const customers = await db.customer.findMany({
      where: { restaurantId: camp.restaurantId, marketingConsent: true, lastOrderAt: { gte: from, lt: to } },
    });
    let n = 0;
    for (const c of customers) if (await deliver(camp.channel, c, camp.message, camp.restaurant.slug)) n++;
    if (n) await db.campaign.update({ where: { id: camp.id }, data: { sentCount: { increment: n } } });
    sent += n;
  }
  return sent;
}
