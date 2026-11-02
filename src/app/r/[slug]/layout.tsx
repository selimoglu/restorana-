import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CartProvider } from "@/components/store/cart";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getRestaurant } from "@/lib/restaurant";
import { BRAND } from "@/lib/brand";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return {};
  const title = `${r.name} | ${r.district ? r.district + " " : ""}${r.cuisine || "Restoran"} · Online Sipariş`;
  return {
    title: { absolute: title },
    description: r.tagline || r.about.slice(0, 155),
    manifest: `/r/${slug}/manifest.webmanifest`,
    openGraph: { title, description: r.tagline, type: "website", locale: "tr_TR", images: r.heroImageUrl ? [r.heroImageUrl] : [] },
    alternates: { canonical: `/r/${slug}` },
    appleWebApp: { capable: true, title: r.name },
  };
}

export default async function StoreLayout({ params, children }: Props) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) notFound();
  const upsells = r.categories
    .flatMap((c) => c.items)
    .filter((i) => i.isUpsell && i.isAvailable)
    .map((i) => ({ id: i.id, name: i.name, price: i.price }));

  return (
    <div style={{ ["--brand" as string]: r.primaryColor }} className="min-h-screen">
      <CartProvider slug={slug}>
        <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <Link href={`/r/${slug}`} className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm text-white">{r.name.charAt(0)}</span>
              <span className="truncate">{r.name}</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-semibold text-stone-700">
              <Link href={`/r/${slug}#menu`} className="hidden rounded-full px-3 py-2 hover:bg-stone-100 sm:inline">Menü</Link>
              <Link href={`/r/${slug}#hakkimizda`} className="hidden rounded-full px-3 py-2 hover:bg-stone-100 md:inline">Hakkımızda</Link>
              <Link href={`/r/${slug}#iletisim`} className="hidden rounded-full px-3 py-2 hover:bg-stone-100 md:inline">Konum</Link>
              {r.phone && (
                <a href={`tel:${r.phone}`} className="rounded-full px-3 py-2 hover:bg-stone-100">Ara</a>
              )}
              <Link href={`/r/${slug}#menu`} className="rounded-full bg-brand px-4 py-2 text-white hover:opacity-90">
                Sipariş ver
              </Link>
            </nav>
          </div>
        </header>
        <main className="pb-24">{children}</main>
        <footer className="bg-stone-950 text-stone-400">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
            <div>
              <p className="text-xl font-extrabold text-white">{r.name}</p>
              {r.tagline && <p className="mt-2 text-sm">{r.tagline}</p>}
            </div>
            <div className="text-sm">
              <p className="mb-2 font-bold text-white">İletişim</p>
              <p>{r.address}</p>
              <p>{[r.district, r.city].filter(Boolean).join(", ")}</p>
              {r.phone && <a href={`tel:${r.phone}`} className="mt-1 block hover:text-white">{r.phone}</a>}
            </div>
            <div className="text-sm">
              <p className="mb-2 font-bold text-white">Bağlantılar</p>
              <Link href={`/r/${slug}#menu`} className="block hover:text-white">Online sipariş</Link>
              {r.instagram && (
                <a href={`https://instagram.com/${r.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:text-white">
                  Instagram
                </a>
              )}
              <Link href="/kvkk" className="block hover:text-white">KVKK Aydınlatma Metni</Link>
            </div>
          </div>
          <p className="border-t border-white/10 py-5 text-center text-xs">
            © {new Date().getFullYear()} {r.name} · Altyapı: {BRAND.name}
          </p>
        </footer>
        <CartDrawer slug={slug} upsells={upsells} minOrder={r.minOrder} />
      </CartProvider>
    </div>
  );
}
