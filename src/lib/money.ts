const fmt = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

/** Kuruşu "₺125,50" biçiminde yazar. */
export function tl(kurus: number): string {
  return fmt.format(kurus / 100);
}

/** "125,50" ya da "125.50" gibi bir metni kuruşa çevirir. */
export function parseTl(input: string): number {
  const clean = input.replace(/[^\d,.-]/g, "");
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
