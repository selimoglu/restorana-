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
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href={`/r/${slug}`} className="text-lg font-extrabold tracking-tight">
              {r.name}
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-stone-600">
              <Link href={`/r/${slug}#menu`}>Menü</Link>
              <Link href={`/r/${slug}#iletisim`} className="hidden sm:inline">
                İletişim
              </Link>
              {r.phone && (
                <a href={`tel:${r.phone}`} className="btn-ghost px-3 py-1.5">
                  Ara
                </a>
              )}
            </nav>
          </div>
        </header>
        <main className="pb-24">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
          <p>
            © {new Date().getFullYear()} {r.name} ·{" "}
            <Link href="/kvkk" className="underline">
              KVKK Aydınlatma Metni
            </Link>
          </p>
          <p className="mt-1">
            {BRAND.name} ile komisyonsuz sipariş altyapısı
          </p>
        </footer>
        <CartDrawer slug={slug} upsells={upsells} minOrder={r.minOrder} />
      </CartProvider>
    </div>
  );
}
