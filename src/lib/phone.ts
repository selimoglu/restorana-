/** Türkiye cep numarasını 905XXXXXXXXX biçimine getirir; geçersizse null döner. */
export function normalizeTrPhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("0090")) d = d.slice(2);
  if (d.startsWith("0")) d = "90" + d.slice(1);
  if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  return /^905\d{9}$/.test(d) ? d : null;
}

export function formatTrPhone(p: string): string {
  const m = p.match(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return m ? `0${m[1]} ${m[2]} ${m[3]} ${m[4]}` : p;
}
