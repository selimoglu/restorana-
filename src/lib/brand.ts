// Ürün adı ve marka bilgileri tek yerden değiştirilebilir.
export const BRAND = {
  name: "Sofra",
  domain: "sofra.app",
  tagline: "Restoranınız için yapay zekâ destekli büyüme platformu",
  supportEmail: "destek@sofra.app",
};

export const PLANS = [
  {
    id: "baslangic",
    name: "Başlangıç",
    price: 1490,
    desc: "Tek şubeli, yeni dijitalleşen işletmeler için.",
    features: [
      "AI ile hazırlanan restoran web sitesi",
      "Komisyonsuz online sipariş (gel-al ve paket)",
      "QR menü",
      "Sipariş paneli ve mutfak ekranı",
      "Kapıda ödeme + online ödeme",
    ],
  },
  {
    id: "buyume",
    name: "Büyüme",
    price: 2990,
    highlight: true,
    desc: "Tekrar eden müşteri kazanmak isteyen restoranlar için.",
    features: [
      "Başlangıç paketindeki her şey",
      "Sadakat puanı ve kuponlar",
      "Otomatik SMS / e-posta / WhatsApp kampanyaları",
      "Google yorum toplama ve AI cevaplar",
      "Markalı mobil uygulama (PWA)",
    ],
  },
  {
    id: "zincir",
    name: "Zincir",
    price: 5990,
    desc: "Birden fazla şubesi olan işletmeler için.",
    features: [
      "Büyüme paketindeki her şey",
      "Çoklu şube yönetimi",
      "AI işletme asistanı ve gelişmiş raporlar",
      "Catering / toplu sipariş",
      "Öncelikli destek",
    ],
  },
];
