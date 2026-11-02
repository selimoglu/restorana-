import Link from "next/link";
import { BRAND, PLANS } from "@/lib/brand";
import { CommissionCalculator } from "@/components/CommissionCalculator";

const FEATURE_GROUPS = [
  {
    title: "Google'da bulunun",
    items: [
      ["AI ile restoran web sitesi", "Menünüzü yapıştırın; site metinleri, ürün açıklamaları ve tasarım dakikalar içinde hazır."],
      ["Yerel SEO", "Restoran şeması, çalışma saatleri ve ilçe odaklı metinlerle “yakınımdaki kebapçı” aramalarında öne çıkın."],
      ["QR menü", "Masaya koyduğunuz QR kod hem menü hem sipariş sayfası olarak çalışır."],
      ["Yorum motoru", "Memnun müşteriler Google'a yönlenir, düşük puanlar size özel geri bildirim olarak kalır."],
    ],
  },
  {
    title: "Komisyonsuz satış yapın",
    items: [
      ["Online sipariş", "Gel-al ve kendi kuryenizle paket servis. Sipariş başına komisyon yok."],
      ["Akıllı ek satış", "Sepette “yanına iyi gider” önerileriyle ortalama sepet tutarını büyütün."],
      ["Esnek ödeme", "iyzico ile online kart, kapıda kart veya nakit."],
      ["Toplu sipariş", "Ofis ve etkinlik siparişleri için catering akışı."],
    ],
  },
  {
    title: "Müşteriniz geri gelsin",
    items: [
      ["Sadakat puanı", "Her siparişte harcamanın bir kısmı puan olarak döner, bir sonraki siparişte TL gibi kullanılır."],
      ["SMS, e-posta, WhatsApp", "AI'ın yazdığı kampanyalarla tek tıkla doğru kitleye ulaşın. İYS ve KVKK uyumlu."],
      ["Otomatik kampanyalar", "“Seni özledik” ve “ilk sipariş teşekkürü” mesajları siz uğraşmadan gider."],
      ["Markalı uygulama", "Müşterileriniz sitenizi telefonlarına kendi logonuzla uygulama olarak kurar."],
    ],
  },
  {
    title: "İşletmenizi yönetin",
    items: [
      ["AI işletme asistanı", "“Bu hafta en çok ne sattı?” diye sorun; gerçek verinize bakıp öneri versin."],
      ["Mutfak ekranı", "Tablette büyük yazılı sipariş akışı, geciken siparişler kırmızıyla."],
      ["Raporlar", "Günlük ciro, sipariş türleri ve komisyondan ne kadar tasarruf ettiğiniz."],
      ["Müşteri listesi", "Telefon numarası ve izinleriyle müşteri veriniz sizde kalır, platformda değil."],
    ],
  },
];

const FAQ = [
  ["Yemek platformlarını bırakmam gerekiyor mu?", "Hayır. Platformlar yeni müşteri bulmak için faydalı. Amacımız, sizi zaten tanıyan müşterilerin siparişlerini komisyonsuz kanala taşımak."],
  ["Kuryem yok, paket servis yapabilir miyim?", "Sadece gel-al ile başlayabilirsiniz. Kendi kuryeniz varsa teslimat ücretini ve minimum tutarı siz belirlersiniz."],
  ["Ödemeler ne zaman hesabıma geçer?", "Online ödemeler iyzico üzerinden alınır ve iyzico'nun standart takvimiyle hesabınıza aktarılır. Kapıda ödemeler doğrudan sizindir."],
  ["KVKK ve İYS konusunda ne yapmam gerekiyor?", "Sipariş ekranında aydınlatma metni ve ticari ileti onayı ayrı ayrı alınır. Kampanyalar yalnızca onay veren müşterilere gönderilir."],
  ["Taahhüt var mı?", "Hayır. Aylık ödersiniz, istediğiniz zaman iptal edersiniz. Yıllık ödemede 2 ay bedava."],
];

export default function Home() {
  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          {BRAND.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a href="#ozellikler" className="hidden sm:inline">Özellikler</a>
          <a href="#fiyatlar" className="hidden sm:inline">Fiyatlar</a>
          <Link href="/r/lezzet-duragi" className="hidden sm:inline">Örnek site</Link>
          <Link href="/giris">Giriş</Link>
          <Link href="/kayit" className="btn-dark">Ücretsiz dene</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-center sm:pt-20">
        <p className="mx-auto mb-4 inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
          Türkiye&apos;deki restoranlar için
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Komisyon ödemeden online sipariş alın, müşterinizi kendinize bağlayın.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600">
          {BRAND.name}, yapay zekâ ile restoranınıza web sitesi, sipariş sistemi, sadakat programı ve otomatik pazarlama kurar. Siz mutfağa odaklanın.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/kayit" className="btn-dark px-6 py-3.5 text-base">
            14 gün ücretsiz başla
          </Link>
          <Link href="/r/lezzet-duragi" className="btn-ghost px-6 py-3.5 text-base">
            Örnek restoran sitesini gör
          </Link>
        </div>
        <p className="mt-3 text-sm text-stone-500">Kurulum ücreti yok · Kredi kartı gerekmez</p>
      </section>

      <section className="bg-stone-50 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Platform komisyonuna ayda ne kadar ödüyorsunuz?</h2>
            <p className="mt-3 text-stone-600">
              Yemek platformları sipariş başına genellikle %20-30 arası komisyon ve ek hizmet bedeli alıyor. Düzenli müşterilerinizin siparişlerini
              kendi kanalınıza taşıdığınızda bu tutar cebinizde kalır.
            </p>
          </div>
          <CommissionCalculator />
        </div>
      </section>

      <section id="ozellikler" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Büyümek için ihtiyacınız olan her şey, tek panelde</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {FEATURE_GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="mb-4 text-xl font-bold text-orange-700">{g.title}</h3>
              <div className="space-y-4">
                {g.items.map(([t, d]) => (
                  <div key={t}>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-stone-600">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-stone-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Nasıl çalışır?</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Menünüzü yapıştırın", "PDF'ten ya da eski sitenizden kopyalayın. AI ürünleri, fiyatları ve açıklamaları düzenler."],
              ["Sitenizi paylaşın", "Instagram biyografinize, Google işletme profilinize ve masalara QR olarak ekleyin."],
              ["Siparişleri alın, müşteriyi tutun", "Siparişler panele ve mutfak ekranına düşer; kampanyalar ve puanlar müşteriyi geri getirir."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl bg-white/5 p-6">
                <span className="text-3xl font-black text-orange-400">{i + 1}</span>
                <p className="mt-2 text-lg font-semibold">{t}</p>
                <p className="mt-1 text-sm text-white/70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="fiyatlar" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Sade fiyatlar, sipariş başına komisyon yok</h2>
        <p className="mt-2 text-center text-stone-600">Fiyatlara KDV dahil değildir. Online kart ödemelerinde yalnızca iyzico&apos;nun işlem ücreti uygulanır.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={`card flex flex-col ${p.highlight ? "border-2 border-stone-900" : ""}`}>
              {p.highlight && <span className="mb-2 self-start rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">En çok tercih edilen</span>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-stone-500">{p.desc}</p>
              <p className="my-4">
                <span className="text-4xl font-extrabold">₺{p.price.toLocaleString("tr-TR")}</span>
                <span className="text-stone-500"> / ay</span>
              </p>
              <ul className="mb-6 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <Link href="/kayit" className={p.highlight ? "btn-dark" : "btn-ghost"}>
                Ücretsiz dene
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-stone-50 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Sık sorulan sorular</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="card">
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-2 text-stone-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-4 py-10 text-sm text-stone-500">
        <p>© {new Date().getFullYear()} {BRAND.name}</p>
        <div className="flex gap-4">
          <Link href="/kvkk">KVKK</Link>
          <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
        </div>
      </footer>
    </div>
  );
}
