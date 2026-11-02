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

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-stone-900 text-white"
        style={r.heroImageUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.65)),url(${r.heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {!r.heroImageUrl && (
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(900px 420px at 80% 0%, color-mix(in srgb, var(--brand) 85%, transparent), transparent 70%), radial-gradient(700px 380px at 0% 100%, color-mix(in srgb, var(--brand) 55%, transparent), transparent 70%), #1c1917" }}
          />
        )}
        <div className="relative mx-auto flex min-h-[460px] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center sm:min-h-[540px]">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${openNow ? "bg-green-500/90" : "bg-white/20"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {openNow ? "Şu an açık · sipariş alıyoruz" : "Şu an kapalı · ileri tarihli sipariş verebilirsiniz"}
          </span>
          <h1 className="mt-5 max-w-3xl text-5xl font-extrabold tracking-tight sm:text-7xl">{r.name}</h1>
          {r.tagline && <p className="mt-4 max-w-xl text-lg text-white/85 sm:text-xl">{r.tagline}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#menu" className="inline-flex items-center rounded-full bg-brand px-7 py-3.5 text-base font-bold text-white shadow-lg hover:opacity-90">
              Online sipariş ver
            </a>
            {r.whatsapp && (
              <a href={`https://wa.me/${r.whatsapp}`} className="inline-flex items-center rounded-full bg-white/15 px-7 py-3.5 text-base font-bold text-white backdrop-blur hover:bg-white/25">
                WhatsApp
              </a>
            )}
          </div>
          <p className="mt-6 text-sm text-white/75">
            {[r.pickupEnabled && "Gel-al", r.deliveryEnabled && "Paket servis", `Hazırlık ~${r.prepMinutes} dk`, r.minOrder > 0 && `Min. sipariş ${tl(r.minOrder)}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </section>

      {/* Sadakat şeridi */}
      <section className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-center sm:flex-row sm:text-left">
          <p className="font-semibold">
            Doğrudan sipariş verin, her siparişte harcamanızın %{r.loyaltyPercent}&apos;i puan olarak size dönsün.
          </p>
          <a href="#uygulama" className="flex-none rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-900">Uygulamayı yükle</a>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {popular.length > 0 && (
          <section className="my-14">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight">En çok sevilenler</h2>
              <a href="#menu" className="text-sm font-semibold text-brand">Tüm menü →</a>
            </div>
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
              {popular.map((i) => (
                <div key={i.id} className="w-64 flex-none snap-start overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                  <ItemImage url={i.imageUrl} name={i.name} className="h-40 w-full" />
                  <div className="p-4">
                    <h3 className="font-bold">{i.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-stone-600">{i.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold">{tl(i.price)}</span>
                      <AddButton item={{ id: i.id, name: i.name, price: i.price }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="menu" className="my-14 scroll-mt-20">
          <h2 className="mb-2 text-3xl font-extrabold tracking-tight">Menü</h2>
          <nav className="sticky top-[61px] z-10 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-[#fafaf9]/95 px-4 py-3 backdrop-blur">
            {r.categories.map((c) => (
              <a key={c.id} href={`#k-${c.id}`} className="whitespace-nowrap rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm font-semibold hover:border-stone-500">
                {c.name}
              </a>
            ))}
          </nav>
          {r.categories.map((c) => (
            <div key={c.id} id={`k-${c.id}`} className="mb-10 scroll-mt-36">
              <h3 className="mb-4 text-xl font-bold">{c.name}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {c.items.map((i) => (
                  <div key={i.id} className={`flex gap-4 rounded-3xl border border-stone-200 bg-white p-4 ${i.isAvailable ? "" : "opacity-60"}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">
                        {i.name} {i.isPopular && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Popüler</span>}
                      </p>
                      {i.description && <p className="mt-1 line-clamp-2 text-sm text-stone-600">{i.description}</p>}
                      {i.allergens && <p className="mt-1 text-xs text-stone-400">Alerjen: {i.allergens}</p>}
                      <div className="mt-3 flex items-center gap-3">
                        <span className="font-bold">{tl(i.price)}</span>
                        <AddButton item={{ id: i.id, name: i.name, price: i.price }} disabled={!i.isAvailable} />
                      </div>
                    </div>
                    <ItemImage url={i.imageUrl} name={i.name} className="h-28 w-28 flex-none rounded-2xl" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {allItems.length === 0 && <p className="text-stone-500">Menü yakında burada.</p>}
        </section>
      </div>

      {r.about && (
        <section id="hakkimizda" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
            <div
              className="aspect-[4/3] rounded-[32px] bg-cover bg-center"
              style={r.heroImageUrl ? { backgroundImage: `url(${r.heroImageUrl})` } : { background: "linear-gradient(135deg, var(--brand), #1c1917)" }}
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-brand">Hikâyemiz</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">{r.cuisine ? `${r.district || r.city}'in ${r.cuisine.toLocaleLowerCase("tr-TR")} adresi` : r.name}</h2>
              <p className="mt-4 leading-relaxed text-stone-700">{r.about}</p>
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-extrabold tracking-tight">Misafirlerimiz ne diyor?</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {reviews.map((rv) => (
                <blockquote key={rv.id} className="rounded-3xl border border-stone-200 bg-white p-6">
                  <p className="text-lg text-amber-500">{"★".repeat(rv.rating)}</p>
                  <p className="mt-2 text-stone-700">“{rv.comment}”</p>
                  <footer className="mt-4 text-sm font-semibold text-stone-500">{rv.customerName}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Uygulama */}
      <section id="uygulama" className="scroll-mt-20 px-4 py-6">
        <div className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-[40px] bg-stone-900 p-8 text-white sm:p-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{r.name} artık telefonunuzda</h2>
            <p className="mt-3 text-white/75">
              Uygulamamızı ana ekranınıza ekleyin; puanlarınızı takip edin, tek dokunuşla tekrar sipariş verin, kampanyalardan ilk siz haberdar olun.
            </p>
            <ol className="mt-5 space-y-2 text-sm text-white/85">
              <li><strong>iPhone:</strong> Safari&apos;de Paylaş → Ana Ekrana Ekle</li>
              <li><strong>Android:</strong> Chrome menüsü → Uygulamayı yükle</li>
            </ol>
          </div>
          <div className="flex justify-center">
            <div className="w-56 rounded-[36px] bg-black p-2.5 shadow-2xl">
              <div className="overflow-hidden rounded-[28px] bg-white text-stone-900">
                <div className="bg-brand p-5 pt-8 text-white">
                  <p className="text-xs opacity-80">Puanınız</p>
                  <p className="text-2xl font-extrabold">₺42,00</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/30"><div className="h-1.5 w-1/2 rounded-full bg-white" /></div>
                </div>
                <div className="space-y-2 p-4 text-xs">
                  {popular.slice(0, 3).map((i) => (
                    <div key={i.id} className="flex justify-between rounded-xl border border-stone-200 p-2">
                      <span className="font-semibold">{i.name}</span>
                      <span>{tl(i.price)}</span>
                    </div>
                  ))}
                  <div className="rounded-xl bg-stone-900 p-2 text-center font-bold text-white">Tekrar sipariş ver</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="iletisim" className="mx-auto grid max-w-6xl scroll-mt-20 gap-6 px-4 py-16 md:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="mb-3 text-2xl font-extrabold">Konum & iletişim</h2>
          <p className="text-stone-700">
            {r.address}
            <br />
            {[r.district, r.city].filter(Boolean).join(", ")}
          </p>
          {r.phone && (
            <p className="mt-2">
              <a className="font-semibold text-brand" href={`tel:${r.phone}`}>
                {r.phone}
              </a>
            </p>
          )}
          <a
            className="mt-5 inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-stone-700"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.address} ${r.district} ${r.city}`)}`}
          >
            Yol tarifi al
          </a>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="mb-3 text-2xl font-extrabold">Çalışma saatleri</h2>
          <dl className="space-y-1.5 text-sm">
            {DAYS.map(([k, label]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-stone-600">{label}</dt>
                <dd className="font-semibold">{hours[k] || "Kapalı"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

function ItemImage({ url, name, className }: { url: string; name: string; className: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} loading="lazy" className={`${className} object-cover`} />;
  }
  return (
    <div
      aria-hidden
      className={`${className} grid place-items-center text-3xl font-extrabold text-white/90`}
      style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 70%, #fbbf24), var(--brand))" }}
    >
      {name.charAt(0)}
    </div>
  );
}
