import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-opus-5-5";

/** API anahtarı (veya başka bir kimlik bilgisi) yoksa AI özellikleri demo moduna düşer. */
export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
export function anthropic(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export const TR_SYSTEM =
  "Türkiye'deki restoranlar için çalışan bir pazarlama ve işletme asistanısın. " +
  "Her zaman doğal, samimi ve akıcı Türkçe yaz. Fiyatları TL ile ver. " +
  "Abartılı vaatlerden, sahte indirim ve yanıltıcı sağlık iddialarından kaçın.";

/** Tek seferlik metin üretimi. Model reddederse sunucu taraflı yedek modele geçer. */
export async function generateText(
  prompt: string,
  opts: { system?: string; maxTokens?: number; effort?: "low" | "medium" | "high" } = {},
): Promise<string> {
  const res = await anthropic().beta.messages.create({
    model: AI_MODEL,
    max_tokens: opts.maxTokens ?? 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: opts.effort ?? "low" },
    system: opts.system ?? TR_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  if (res.stop_reason === "refusal") throw new Error("İstek AI tarafından reddedildi.");
  return res.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/** Yanıttaki ilk JSON nesnesini/dizisini ayıklar. */
export function extractJson<T>(text: string): T {
  const start = text.search(/[[{]/);
  const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (start < 0 || end < start) throw new Error("AI yanıtında JSON bulunamadı");
  return JSON.parse(text.slice(start, end + 1)) as T;
}
