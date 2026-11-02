import { getRestaurant } from "@/lib/restaurant";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return new Response("Bulunamadı", { status: 404 });
  const letter = r.name.trim().charAt(0).toLocaleUpperCase("tr-TR");
  const color = /^#[0-9a-fA-F]{6}$/.test(r.primaryColor) ? r.primaryColor : "#c2410c";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="300" font-weight="700" fill="#fff">${letter.replace(/[<>&"]/g, "")}</text></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });
}
