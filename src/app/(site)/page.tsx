import Link from "next/link";
import { BRAND, PRODUCT_GROUPS } from "@/lib/brand";
import { CommissionCalculator } from "@/components/CommissionCalculator";
import { PhoneMockup, ScoreCard } from "@/components/site/PhoneMockup";
import { ClosingCta } from "@/components/site/ClosingCta";
import { FAQ, FaqList } from "./FaqList";

// Örnek hesaplar: platform komisyonu %25 varsayımıyla, siparişlerin bir kısmı kendi kanalına taşındığında aylık tasarruf.
const SCENARIOS = [
  { type: "Burgerci", place: "Kadıköy, İstanbul", orders: 900, basket: 420, share: 35, tag: "Gel-al + paket" },
  { type: "Pideci", place: "Çankaya, Ankara", orders: 600, basket: 330, share: 40, tag: "Kendi kuryesi" },
  { type: "Kahvaltı salonu", place: "Bornova, İzmir", orders: 350, basket: 650, share: 30, tag: "Hafta sonu yoğun" },
  { type: "Kebapçı", place: "Şahinbey, Gaziantep", orders: 1200, basket: 380, share: 30, tag: "Çok şubeli" },
  { type: "Tatlıcı", place: "Muratpaşa, Antalya", orders: 500, basket: 280, share: 45, tag: "Sadakat odaklı" },
  { type: "Pizzacı", place: "Nilüfer, Bursa", orders: 800, basket: 450, share: 35, tag: "Kampanya odaklı" },
];
const saving = (s: (typeof SCENARIOS)[number]) => Math.round((s.orders * s.basket * 0.25 * s.share) / 100 / 100) * 100;

const BELIEFS = [
  ["Müşteri restoranındır, platformun değil.", "Size sipariş veren kişinin telefon numarası ve izni sizde olmalı. Ona ne zaman, ne mesaj atacağınıza siz karar vermelisiniz."],
  ["Teknoloji, mahalle restoranına da zincirlerle aynı imkânı vermeli.", "Kendi uygulaması, sadakat programı ve pazarlama ekibi olan büyük markalarla aynı araçlar, tek başına çalışan işletmeye de uygun fiyata sunulmalı."],
  ["Restoran sahibinin zamanı mutfakta geçmeli.", "Site yazmak, kampanya kurmak, yorum cevaplamak gibi işleri yapay zekâ üstlensin; siz yemeğe ve misafire odaklanın."],
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-ink ring-1 ring-ink/10">
              <span className="h-2 w-2 rounded-full bg-site" /> Türkiye&apos;deki restoranlar için
            </p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-7xl">
              Restoranınızı internette büyüten yapay zekâ platformu.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-700">
              Web sitesi, komisyonsuz online sipariş, markalı uygulama, sadakat ve otomatik pazarlama tek yerde. Restoranınızın adını yazın,
              internetteki durumunu ücretsiz değerlendirelim.
            </p>
            <form action="/rapor" className="mt-8 flex max-w-xl flex-col gap-2 rounded-3xl bg-white p-2 shadow-xl ring-1 ring-ink/10 sm:flex-row sm:rounded-full">
              <input
                name="ad"
                required
                placeholder="Restoranınızın adı"
                className="flex-1 rounded-full px-5 py-3 text-base outline-none"
                aria-label="Restoranınızın adı"
              />
              <button className="btn-site px-6 py-3.5 text-base">Ücretsiz raporumu al</button>
            </form>
            <p className="mt-4 text-sm text-stone-600">Kurulum ücreti yok · Taahhüt yok · Ödemeler iyzico güvencesinde</p>
          </div>
          <div className="relative flex justify-center">
            <PhoneMockup />
            <div className="absolute -left-2 bottom-10 hidden sm:block lg:-left-6">
              <ScoreCard />
            </div>
            <div className="absolute -right-2 top-10 hidden rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-black/5 sm:block">
              <p className="text-xs text-stone-500">Yeni sipariş</p>
              <p className="font-bold">₺640 · komisyon ₺0</p>
            </div>
          </div>
        </div>
      </section>

      {/* Örnek hesaplar */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="site-h2 max-w-2xl">Doğrudan siparişle ne kadar kazanırsınız?</h2>
            <p className="max-w-sm text-sm text-stone-600">
              Örnek hesaplardır: %25 platform komisyonu ve siparişlerin bir kısmının kendi sitenize taşındığı varsayılmıştır.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s) => (
              <div key={s.type} className="rounded-3xl bg-soft p-6">
                <p className="text-4xl font-extrabold text-ink">₺{saving(s).toLocaleString("tr-TR")}</p>
                <p className="text-sm font-semibold text-site">aylık komisyon tasarrufu</p>
                <div className="mt-6 flex items-end justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink">{s.type}</p>
                    <p className="text-sm text-stone-600">{s.place}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">{s.tag}</span>
                </div>
                <p className="mt-3 text-xs text-stone-500">
                  Ayda {s.orders} sipariş · ort. sepet ₺{s.basket} · %{s.share}&apos;i kendi kanalında
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dört fayda */}
      <section className="bg-soft py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="site-h2 max-w-3xl">{BRAND.name} ile daha fazla trafik, daha fazla satış, daha fazla geri dönen müşteri.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_GROUPS.map((g, i) => (
              <a key={g.id} href={`#${g.id}`} className="group rounded-3xl bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-lg font-extrabold text-accent">{i + 1}</span>
                <p className="mt-6 text-xl font-extrabold text-ink">{g.short}</p>
                <p className="mt-2 text-sm text-stone-600">{g.desc}</p>
                <p className="mt-4 text-sm font-semibold text-site group-hover:underline">Ayrıntılar →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Büyük markaların teknolojisi */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
          <div className="hero-gradient flex justify-center rounded-[40px] py-12">
            <PhoneMockup variant="rewards" />
          </div>
          <div>
            <p className="eyebrow">Tek platform</p>
            <h2 className="site-h2 mt-3">Büyük zincirlerin teknolojisi, artık sizin restoranınızda.</h2>
            <div className="mt-8 space-y-6">
              {[
                ["Kendi uygulamanız", "Müşterileriniz logonuzla telefonlarına kurar, puan biriktirir, tek dokunuşla tekrar sipariş verir."],
                ["Google'da üst sıralar", "Her ürün ve semt için otomatik hazırlanan sayfalar, sizi arayanları platform yerine size getirir."],
                ["Komisyonsuz sipariş", "Sipariş başına yüzde ödemeden online satış; ödeme iyzico ile doğrudan size."],
              ].map(([t, d]) => (
                <div key={t} className="flex gap-4">
                  <span className="mt-1 grid h-7 w-7 flex-none place-items-center rounded-full bg-site text-sm text-white">✓</span>
                  <div>
                    <p className="text-lg font-bold text-ink">{t}</p>
                    <p className="text-stone-600">{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/kayit" className="btn-site mt-8">Ücretsiz başla</Link>
          </div>
        </div>
      </section>

      {/* Ürün grupları */}
      {PRODUCT_GROUPS.map((g, i) => (
        <section key={g.id} id={g.id} className={`scroll-mt-20 py-20 ${i % 2 === 0 ? "bg-soft" : ""}`}>
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <p className="eyebrow">{g.title}</p>
              <h2 className="site-h2 mt-3">{g.short}</h2>
              <p className="mt-4 text-lg text-stone-600">{g.desc}</p>
              <Link href="/kayit" className="btn-site mt-8">Hemen başla</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.items.map(([t, d]) => (
                <div key={t} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
                  <p className="font-bold text-ink">{t}</p>
                  <p className="mt-2 text-sm text-stone-600">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Komisyon hesaplayıcı */}
      <section id="hesapla" className="ink-gradient scroll-mt-20 py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-accent">Hesaplayın</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Platform komisyonuna ayda ne kadar ödüyorsunuz?</h2>
            <p className="mt-4 text-lg text-white/75">
              Yemek platformları sipariş başına genellikle %20-30 arası komisyon ve hizmet bedeli alıyor. Düzenli müşterilerinizin siparişlerini
              kendi kanalınıza taşıdığınızda bu tutar cebinizde kalır.
            </p>
          </div>
          <div className="text-ink">
            <CommissionCalculator />
          </div>
        </div>
      </section>

      {/* İlkeler */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="site-h2 max-w-2xl">Bizi yönlendiren 3 ilke</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {BELIEFS.map(([t, d], i) => (
              <div key={t} className="border-t-2 border-ink pt-6">
                <p className="text-sm font-bold text-site">0{i + 1}</p>
                <p className="mt-2 text-xl font-extrabold text-ink">{t}</p>
                <p className="mt-3 text-stone-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ücretsiz kaynaklar */}
      <section className="bg-soft py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2">
          <h2 className="site-h2">Ücretsiz araçlarla restoranınızı büyütün</h2>
          <div className="divide-y divide-ink/10">
            {[
              ["Restoranınızın online görünürlük raporu", "/rapor"],
              ["Komisyon tasarruf hesaplayıcı", "/#hesapla"],
              ["Örnek restoran sitesini gezin", "/r/lezzet-duragi"],
              ["Kurulum adım adım nasıl yapılır?", "/nasil-calisir"],
            ].map(([t, href]) => (
              <Link key={t} href={href} className="flex items-center justify-between py-5 text-lg font-bold text-ink hover:text-site">
                {t} <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="site-h2 mb-10 text-center">Sık sorulan sorular</h2>
          <FaqList items={FAQ} />
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
