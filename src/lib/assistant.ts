import type Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL, anthropic, TR_SYSTEM } from "./ai";
import { db } from "./db";
import { tl } from "./money";

type Tool = Anthropic.Beta.BetaTool;

const TOOLS: Tool[] = [
  {
    name: "satis_ozeti",
    description: "Son N günün ciro, sipariş sayısı, ortalama sepet ve sipariş türü/ödeme dağılımını getirir.",
    input_schema: { type: "object", properties: { gun: { type: "integer", description: "Kaç günlük (1-90)" } }, required: ["gun"] },
  },
  {
    name: "en_cok_satanlar",
    description: "Son N günde en çok satılan ve en az satılan ürünleri adet ve ciroyla getirir.",
    input_schema: { type: "object", properties: { gun: { type: "integer" } }, required: ["gun"] },
  },
  {
    name: "musteri_ozeti",
    description: "Müşteri sayıları, ticari ileti onayı olanlar, kaybedilme riski olanlar ve en sadık müşteriler.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "menu_listesi",
    description: "Kategorileriyle tüm menü, fiyatlar ve stok durumu.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "kampanya_taslagi_olustur",
    description:
      "Kampanyalar sayfasına bir taslak kampanya kaydeder (göndermez). Restoran sahibi açıkça istediğinde kullan. {ad} ve {link} yer tutucularını kullan.",
    input_schema: {
      type: "object",
      properties: {
        ad: { type: "string" },
        kanal: { type: "string", enum: ["SMS", "EMAIL", "WHATSAPP"] },
        kitle: { type: "string", enum: ["ALL", "LAPSED", "VIP", "NEW"] },
        mesaj: { type: "string" },
      },
      required: ["ad", "kanal", "kitle", "mesaj"],
    },
  },
];

async function runTool(restaurantId: string, name: string, input: Record<string, unknown>): Promise<string> {
  const days = Math.min(90, Math.max(1, Number(input.gun) || 7));
  const since = new Date(Date.now() - days * 86400000);
  switch (name) {
    case "satis_ozeti": {
      const orders = await db.order.findMany({
        where: { restaurantId, createdAt: { gte: since }, status: { not: "CANCELLED" } },
        select: { total: true, type: true, paymentMethod: true, createdAt: true },
      });
      const revenue = orders.reduce((s, o) => s + o.total, 0);
      const by = (k: "type" | "paymentMethod") =>
        Object.entries(orders.reduce<Record<string, number>>((a, o) => ((a[o[k]] = (a[o[k]] ?? 0) + 1), a), {}));
      const hours = orders.reduce<Record<number, number>>((a, o) => {
        const h = (o.createdAt.getUTCHours() + 3) % 24;
        a[h] = (a[h] ?? 0) + 1;
        return a;
      }, {});
      return JSON.stringify({
        gun: days,
        siparis: orders.length,
        ciro: tl(revenue),
        ortalama_sepet: orders.length ? tl(Math.round(revenue / orders.length)) : "-",
        tur: by("type"),
        odeme: by("paymentMethod"),
        saatlere_gore: hours,
      });
    }
    case "en_cok_satanlar": {
      const rows = await db.orderItem.groupBy({
        by: ["name"],
        where: { order: { restaurantId, createdAt: { gte: since }, status: { not: "CANCELLED" } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
      });
      const items = await db.menuItem.findMany({ where: { restaurantId }, select: { name: true, price: true } });
      const list = items.map((i) => {
        const q = rows.find((r) => r.name === i.name)?._sum.quantity ?? 0;
        return { urun: i.name, adet: q, ciro: tl(q * i.price) };
      });
      list.sort((a, b) => b.adet - a.adet);
      return JSON.stringify({ gun: days, en_cok: list.slice(0, 8), en_az: list.slice(-5) });
    }
    case "musteri_ozeti": {
      const all = await db.customer.findMany({ where: { restaurantId } });
      const lapsed = all.filter((c) => c.lastOrderAt && c.lastOrderAt < new Date(Date.now() - 14 * 86400000));
      return JSON.stringify({
        toplam: all.length,
        iys_onayli: all.filter((c) => c.marketingConsent).length,
        kayip_riski_14_gun: lapsed.length,
        tek_siparisli: all.filter((c) => c.orderCount <= 1).length,
        en_sadik: [...all]
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 5)
          .map((c) => ({ ad: c.name, siparis: c.orderCount, harcama: tl(c.totalSpent) })),
      });
    }
    case "menu_listesi": {
      const cats = await db.category.findMany({ where: { restaurantId }, include: { items: true }, orderBy: { sort: "asc" } });
      return JSON.stringify(
        cats.map((c) => ({ kategori: c.name, urunler: c.items.map((i) => ({ ad: i.name, fiyat: tl(i.price), satista: i.isAvailable })) })),
      );
    }
    case "kampanya_taslagi_olustur": {
      const c = await db.campaign.create({
        data: {
          restaurantId,
          name: String(input.ad).slice(0, 80),
          channel: String(input.kanal),
          audience: String(input.kitle),
          message: String(input.mesaj).slice(0, 1000),
        },
      });
      return JSON.stringify({ ok: true, id: c.id, not: "Taslak kaydedildi, Kampanyalar sayfasından gönderilebilir." });
    }
    default:
      return JSON.stringify({ hata: "Bilinmeyen araç" });
  }
}

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

/** Restoran verisine araçlarla erişen işletme asistanı. Araç çağrıları bitene kadar döngü kurar. */
export async function askAssistant(restaurantId: string, restaurantName: string, history: ChatTurn[]): Promise<string> {
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({ role: t.role, content: t.text }));
  const system =
    `${TR_SYSTEM}\nŞu an "${restaurantName}" restoranının sahibine yardım ediyorsun. Sorulara cevap vermeden önce ` +
    `gerekiyorsa araçlarla gerçek veriye bak, rakam uydurma. Kısa, uygulanabilir öneriler ver; Türkiye pazarını ` +
    `(yemek platformu komisyonları, İYS kuralları, yerel alışkanlıklar) göz önünde bulundur. Bugün: ${new Date().toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}.`;

  for (let step = 0; step < 8; step++) {
    const res = await anthropic().beta.messages.create({
      model: AI_MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system,
      tools: TOOLS,
      messages,
    });
    if (res.stop_reason === "refusal") return "Bu isteğe yardımcı olamıyorum.";
    messages.push({ role: "assistant", content: res.content });
    const calls = res.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (res.stop_reason !== "tool_use" || calls.length === 0) {
      return res.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
    }
    const results = await Promise.all(
      calls.map(async (c) => {
        try {
          return { type: "tool_result" as const, tool_use_id: c.id, content: await runTool(restaurantId, c.name, c.input as Record<string, unknown>) };
        } catch (e) {
          return { type: "tool_result" as const, tool_use_id: c.id, is_error: true, content: String(e) };
        }
      }),
    );
    messages.push({ role: "user", content: results });
  }
  return "Yanıt çok uzun sürdü, soruyu daraltarak tekrar dener misiniz?";
}
