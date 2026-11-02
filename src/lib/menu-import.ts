import { aiEnabled, extractJson, generateText } from "./ai";
import { db } from "./db";
import { parseTl } from "./money";

export type ParsedMenu = { category: string; items: { name: string; description: string; price: number }[] }[];

export async function parseMenuText(text: string): Promise<ParsedMenu> {
  if (!aiEnabled()) {
    // Basit ayrıştırıcı: "Ürün adı ..... 120" satırları, fiyatsız satırlar kategori sayılır
    const out: ParsedMenu = [];
    for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const m = line.match(/^(.+?)[\s.:-]+(\d+(?:[.,]\d{1,2})?)\s*(?:tl|₺)?$/i);
      if (m) {
        if (!out.length) out.push({ category: "Menü", items: [] });
        out[out.length - 1].items.push({ name: m[1].trim(), description: "", price: parseTl(m[2]) / 100 });
      } else out.push({ category: line, items: [] });
    }
    return out.filter((c) => c.items.length);
  }
  const raw = await generateText(
    "Aşağıdaki restoran menüsünü JSON'a çevir. Biçim: " +
      '[{"category":"Kategori","items":[{"name":"Ürün","description":"kısa iştah açıcı açıklama","price":120.5}]}]. ' +
      "Fiyat TL cinsinden sayı olsun. Açıklama yoksa kısa ve abartısız bir tane yaz. Sadece JSON döndür.\n\n" +
      text,
    { maxTokens: 16000 },
  );
  return extractJson<ParsedMenu>(raw);
}

export async function importMenu(restaurantId: string, menu: ParsedMenu) {
  let sort = await db.category.count({ where: { restaurantId } });
  for (const c of menu) {
    const cat = await db.category.create({ data: { name: c.category.slice(0, 80), restaurantId, sort: sort++ } });
    await db.menuItem.createMany({
      data: c.items
        .filter((i) => i.name && i.price > 0)
        .map((i, idx) => ({
          name: i.name.slice(0, 120),
          description: (i.description ?? "").slice(0, 300),
          price: Math.round(i.price * 100),
          categoryId: cat.id,
          restaurantId,
          sort: idx,
        })),
    });
  }
}

