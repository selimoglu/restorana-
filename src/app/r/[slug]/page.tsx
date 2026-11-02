import { notFound } from "next/navigation";
import { AddButton } from "@/components/store/AddButton";
import { db } from "@/lib/db";
import { tl } from "@/lib/money";
import { DAYS, getRestaurant, isOpenNow, parseHours } from "@/lib/restaurant";

export const dynamic = "force-dynamic";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) notFound();
  const reviews = await db.review.findMany({
    where: { restaurantId: r.id, isPublic: true, rating: { gte: 4 } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const hours = parseHours(r.openingHours);
  const openNow = r.isOpen && isOpenNow(r.openingHours);
  const popular = r.categories.flatMap((c) => c.items).filter((i) => i.isPopular && i.isAvailable);
  const allItems = r.categories.flatMap((c) => c.items);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    description: r.about,
    servesCuisine: r.cuisine,
    telephone: r.phone,
    url: `${appUrl}/r/${slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: r.address,
      addressLocality: r.district,
      addressRegion: r.city,
      addressCountry: "TR",
    },
    priceRange: "₺₺",
    acceptsReservations: false,
    hasMenu: `${appUrl}/r/${slug}#menu`,
    openingHoursSpecification: DAYS.filter(([k]) => hours[k]).map(([k]) => {
      const [opens, closes] = hours[k].split("-");
      const en = { pzt: "Monday", sal: "Tuesday", car: "Wednesday", per: "Thursday", cum: "Friday", cmt: "Saturday", paz: "Sunday" }[k];
      return { "@type": "OpeningHoursSpecification", dayOfWeek: en, opens, closes };
    }),
    potentialAction: { "@type": "OrderAction", target: `${appUrl}/r/${slug}#menu`, deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModePickUp", "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"] },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section
        className="relative overflow-hidden bg-stone-900 text-white"
        style={r.heroImageUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url(${r.heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {!r.heroImageUrl && <div className="absolute inset-0 bg-gradient-to-br from-brand/80 to-stone-900" />}
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${openNow ? "bg-green-500/90" : "bg-stone-500/90"}`}>
            {openNow ? "Şu an açık · sipariş alıyoruz" : "Şu an kapalı · ileri tarihli sipariş verebilirsiniz"}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{r.name}</h1>
          {r.tagline && <p className="mt-3 max-w-xl text-lg text-white/85">{r.tagline}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#menu" className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-stone-900 hover:bg-stone-100">
              Sipariş ver
            </a>
            {r.whatsapp && (
              <a href={`https://wa.me/${r.whatsapp}`} className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                WhatsApp
              </a>
            )}
          </div>
          <p className="mt-6 text-sm text-white/70">
            {r.pickupEnabled && "Gel-al"} {r.pickupEnabled && r.deliveryEnabled && "·"} {r.deliveryEnabled && "Paket servis"} · Hazırlık ~{r.prepMinutes} dk
            {r.minOrder > 0 && ` · Min. sipariş ${tl(r.minOrder)}`}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <div className="my-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Doğrudan sipariş ver, kazan:</strong> Buradan verdiğiniz her siparişte harcamanızın %{r.loyaltyPercent}&apos;i puan olarak
          hesabınıza döner. Bir sonraki siparişte TL gibi kullanabilirsiniz.
        </div>

        {popular.length > 0 && (
          <section className="my-10">
            <h2 className="mb-4 text-2xl font-bold">En çok sevilenler</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((i) => (
                <div key={i.id} className="card flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{i.name}</h3>
                    <p className="mt-1 text-sm text-stone-600">{i.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold">{tl(i.price)}</span>
                    <AddButton item={{ id: i.id, name: i.name, price: i.price }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="menu" className="my-10 scroll-mt-20">
          <h2 className="mb-2 text-2xl font-bold">Menü</h2>
          <nav className="sticky top-[57px] z-10 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-stone-50/95 px-4 py-2">
            {r.categories.map((c) => (
              <a key={c.id} href={`#k-${c.id}`} className="whitespace-nowrap rounded-full border border-stone-300 bg-white px-3 py-1 text-sm">
                {c.name}
              </a>
            ))}
          </nav>
          {r.categories.map((c) => (
            <div key={c.id} id={`k-${c.id}`} className="mb-8 scroll-mt-32">
              <h3 className="mb-3 text-xl font-semibold">{c.name}</h3>
              <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
                {c.items.map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {i.name} {i.isPopular && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">Popüler</span>}
                      </p>
                      {i.description && <p className="mt-0.5 text-sm text-stone-600">{i.description}</p>}
                      {i.allergens && <p className="mt-0.5 text-xs text-stone-400">Alerjen: {i.allergens}</p>}
                      <p className="mt-1 font-semibold">{tl(i.price)}</p>
                    </div>
                    <AddButton item={{ id: i.id, name: i.name, price: i.price }} disabled={!i.isAvailable} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {allItems.length === 0 && <p className="text-stone-500">Menü yakında burada.</p>}
        </section>

        {r.about && (
          <section className="my-10 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-3 text-2xl font-bold">Hikâyemiz</h2>
              <p className="leading-relaxed text-stone-700">{r.about}</p>
            </div>
            {reviews.length > 0 && (
              <div>
                <h2 className="mb-3 text-2xl font-bold">Misafirlerimiz ne diyor?</h2>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((rv) => (
                    <blockquote key={rv.id} className="card text-sm">
                      <p className="text-amber-500">{"★".repeat(rv.rating)}</p>
                      <p className="mt-1 text-stone-700">“{rv.comment}”</p>
                      <footer className="mt-2 text-stone-500">— {rv.customerName}</footer>
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section id="iletisim" className="my-10 grid scroll-mt-20 gap-6 sm:grid-cols-2">
          <div className="card">
            <h2 className="mb-3 text-xl font-bold">Adres & iletişim</h2>
            <p className="text-stone-700">
              {r.address}
              <br />
              {r.district}
              {r.district && ", "}
              {r.city}
            </p>
            {r.phone && (
              <p className="mt-2">
                <a className="font-semibold text-brand" href={`tel:${r.phone}`}>
                  {r.phone}
                </a>
              </p>
            )}
            <a
              className="btn-ghost mt-4"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.address} ${r.district} ${r.city}`)}`}
            >
              Yol tarifi al
            </a>
          </div>
          <div className="card">
            <h2 className="mb-3 text-xl font-bold">Çalışma saatleri</h2>
            <dl className="space-y-1 text-sm">
              {DAYS.map(([k, label]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-stone-600">{label}</dt>
                  <dd className="font-medium">{hours[k] || "Kapalı"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </>
  );
}
