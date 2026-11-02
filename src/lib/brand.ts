// Ürün adı, renkler ve paketler tek yerden değiştirilir.
// Renkler kök layout'ta CSS değişkeni olarak sayfaya basılır (--site-*).
export const BRAND = {
  name: "Sofra",
  domain: "sofra.app",
  tagline: "Restoranlar için yapay zekâ büyüme platformu",
  supportEmail: "destek@sofra.app",
  supportPhone: "0850 000 00 00",
  colors: {
    primary: "#0f7a4a", // ana renk: butonlar, vurgular
    primaryDark: "#0a5a37", // ana rengin koyusu (hover)
    ink: "#0b2a1d", // koyu bölümler ve başlıklar
    soft: "#e8f5ee", // açık arka plan
    accent: "#c8f169", // küçük vurgular (rozet, ilerleme çubuğu)
  },
};

// Ürün menüsü: üst menüdeki açılır liste, alt bilgi ve özellik sayfaları buradan beslenir.
export const PRODUCT_GROUPS = [
  {
    id: "kesfedilme",
    title: "Online keşfedilme",
    short: "Daha fazla Google trafiği",
    desc: "Sizi arayan aç müşteri, platform yerine sizin sitenize gelsin.",
    items: [
      ["AI restoran web sitesi", "Menünüzü yapıştırın; metinler, ürün açıklamaları ve tasarım dakikalar içinde hazır."],
      ["Yerel SEO", "Restoran şeması, çalışma saatleri ve semt odaklı metinlerle yakınınızdaki aramalarda öne çıkın."],
      ["QR menü", "Masadaki QR kod hem menü hem sipariş sayfası olarak çalışır."],
      ["Yorum motoru", "Memnun müşteriler Google'a yönlenir, düşük puanlar size özel geri bildirim olarak kalır."],
    ],
  },
  {
    id: "satis",
    title: "Online satış",
    short: "Daha fazla komisyonsuz sipariş",
    desc: "Gel-al ve kendi kuryenizle paket servis, sipariş başına komisyon yok.",
    items: [
      ["Online sipariş", "Gel-al ve kendi kuryenizle teslimat. Minimum tutarı ve teslimat ücretini siz belirlersiniz."],
      ["Akıllı ek satış", "Sepette “yanına iyi gider” önerileriyle ortalama sepeti büyütün."],
      ["Esnek ödeme", "iyzico ile online kart, kapıda kart veya nakit."],
      ["Toplu sipariş", "Ofis ve etkinlik siparişleri için catering akışı."],
    ],
  },
  {
    id: "tekrar",
    title: "Tekrar sipariş",
    short: "Daha fazla geri dönen müşteri",
    desc: "Bir kez sipariş veren müşteri, kampanyalar ve puanlarla tekrar gelsin.",
    items: [
      ["Sadakat puanı", "Harcamanın bir kısmı puan olarak döner, sonraki siparişte TL gibi kullanılır."],
      ["SMS, e-posta, WhatsApp", "Yapay zekânın yazdığı kampanyalar, İYS ve KVKK uyumlu."],
      ["Otomatik kampanyalar", "“Seni özledik” ve “ilk sipariş teşekkürü” mesajları kendiliğinden gider."],
      ["Markalı uygulama", "Müşteriler sitenizi kendi logonuzla telefonlarına uygulama olarak kurar."],
    ],
  },
  {
    id: "isletme",
    title: "İşletme yönetimi",
    short: "Daha az iş yükü",
    desc: "Siparişler, müşteriler ve raporlar tek panelde.",
    items: [
      ["AI işletme asistanı", "“Bu hafta en çok ne sattı?” diye sorun; verinize bakıp öneri versin."],
      ["Mutfak ekranı", "Tablette büyük yazılı sipariş akışı, geciken siparişler kırmızıyla."],
      ["Raporlar", "Günlük ciro, sipariş türleri ve komisyondan tasarrufunuz."],
      ["Müşteri listesi", "Telefon numaraları ve izinleriyle müşteri veriniz sizde kalır."],
    ],
  },
] as const;

// Paketler: fiyatlar TL, KDV hariç.
export const PLANS = [
  {
    id: "esnek",
    name: "Esnek",
    price: 1490,
    fee: "+ sipariş başına %3 hizmet bedeli",
    desc: "Online siparişe yeni başlayan restoranlar için. Bedeli dilerseniz müşteriye yansıtabilirsiniz.",
  },
  {
    id: "sabit",
    name: "Sabit",
    price: 3990,
    fee: "Sipariş başına ücret yok",
    highlight: true,
    desc: "Ayda 60.000 TL üzeri online satış yapan restoranlar için en avantajlı paket.",
  },
];

export const INCLUDED = [
  "AI ile hazırlanan restoran web sitesi",
  "Komisyonsuz online sipariş (gel-al ve paket)",
  "Markalı mobil uygulama (PWA)",
  "Otomatik yerel SEO sayfaları",
  "Sadakat puanı ve kuponlar",
  "AI ile SMS / e-posta / WhatsApp pazarlaması",
  "Toplu sipariş ve catering",
];

export const SERVICES = [
  ["Ücretsiz kurulum", "Menünüzü ve sitenizi biz taşırız."],
  ["iyzico güvencesi", "Kart ödemeleri lisanslı ödeme kuruluşu üzerinden."],
  ["Türkçe destek", "Hafta içi ve hafta sonu telefon ve WhatsApp desteği."],
];
