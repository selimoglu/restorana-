import { getRestaurant } from "@/lib/restaurant";

// Markalı mobil uygulama: restoran sitesi telefona "Ana ekrana ekle" ile uygulama olarak kurulabilir.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return new Response("Bulunamadı", { status: 404 });
  return Response.json(
    {
      name: r.name,
      short_name: r.name.slice(0, 12),
      description: r.tagline,
      lang: "tr",
      start_url: `/r/${slug}`,
      scope: `/r/${slug}`,
      display: "standalone",
      background_color: "#fafaf9",
      theme_color: r.primaryColor,
      icons: [{ src: `/r/${slug}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
