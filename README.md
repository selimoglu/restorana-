# Sofra — Restoranlar için AI destekli büyüme platformu

Türkiye'deki restoranlara komisyonsuz online sipariş, AI ile hazırlanan web sitesi, sadakat programı ve otomatik pazarlama sunan çok kiracılı (multi-tenant) bir SaaS.

> Ürün adı, renkler, paket fiyatları ve ürün menüsü `src/lib/brand.ts` dosyasından tek yerden değiştirilebilir.

## Hızlı başlangıç

```bash
docker run -d --name sofra-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:17   # yerel PostgreSQL
npm install
cp .env.example .env        # gerekirse anahtarları doldurun
npm run db:push             # veritabanı tablolarını oluşturur
npm run db:seed             # örnek restoran: "Lezzet Durağı"
npm run dev
```

- Tanıtım sitesi: http://localhost:3000
- Örnek restoran sitesi: http://localhost:3000/r/lezzet-duragi
- Yönetim paneli: http://localhost:3000/giris — `demo@sofra.app` / `demo1234`

Anahtar girilmeden de her şey çalışır: AI, iyzico, SMS ve e-posta **demo modunda** çalışır (AI hazır metin döner, ödeme başarılı sayılır, mesajlar konsola yazılır).

## Özellikler

| Alan | Özellik | Durum |
|---|---|---|
| Keşfedilme | AI ile restoran web sitesi (slogan, hakkımızda, SEO metni) | ✅ |
| | Yerel SEO: `Restaurant` şeması, çalışma saatleri, Open Graph | ✅ |
| | Online / QR menü (panelde QR kod) | ✅ |
| | Yorum motoru: 4-5★ Google'a yönlenir, düşük puan size özel kalır; AI yanıt önerisi | ✅ |
| Online satış | Komisyonsuz sipariş: gel-al ve kendi kuryeyle paket servis | ✅ |
| | Akıllı ek satış ("yanına iyi gider") | ✅ |
| | iyzico Ödeme Formu, kapıda kart, kapıda nakit | ✅ |
| | Kupon kodları, minimum sepet, ücretsiz teslimat limiti | ✅ |
| | Sipariş takip sayfası + SMS bildirimleri | ✅ |
| Tekrar sipariş | Sadakat puanı (harcamanın %'si, TL gibi kullanılır) | ✅ |
| | SMS / e-posta / WhatsApp kampanyaları, AI ile metin yazımı | ✅ |
| | Otomatik kampanyalar: "seni özledik" (14 gün), ilk sipariş teşekkürü | ✅ |
| | Markalı uygulama (PWA: ana ekrana ekle, restoran logosu/rengi) | ✅ |
| | KVKK aydınlatma + ayrı İYS ticari ileti onayı | ✅ |
| İşletme | Sipariş paneli, mutfak ekranı (tablet), açık/kapalı düğmesi | ✅ |
| | Raporlar: günlük ciro, komisyondan tasarruf tahmini | ✅ |
| | AI işletme asistanı (satış, menü ve müşteri verisine araçlarla erişir, kampanya taslağı açar) | ✅ |
| | AI ile menü içe aktarma (yapıştırılan metinden kategori/ürün/fiyat) | ✅ |
| | Self-servis kayıt (5 dakikada site) | ✅ |

### Türkiye için bilinçli olarak dışarıda bırakılanlar / sonraki aşama

- **ABD'ye özgü teslimat ağları (DoorDash Drive vb.) ve ABD POS entegrasyonları**: Türkiye'de karşılığı yok. Yerine restoranın kendi kuryesi destekleniyor.
- **AI telefonla sipariş**: Türkçe ses altyapısı ve operatör entegrasyonu gerektirdiği için sonraki aşamada.
- **Yemeksepeti / Getir / Trendyol Yemek sipariş entegrasyonu**: Siparişleri tek panelde toplamak için sonraki aşamada (platform API erişimi gerekiyor).
- **e-Arşiv fatura**: Entegratör (ör. Paraşüt, Logo) seçimine göre eklenecek.
- **Mağaza uygulaması (App Store / Google Play)**: Şimdilik PWA; talep olursa Capacitor/Expo ile paketlenebilir.
- **Abonelik tahsilatı**: Paketler tanımlı, ödeme alımı (iyzico abonelik) henüz bağlı değil.

## Mimari

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS 4**
- **Prisma + PostgreSQL** (canlıda Supabase, Frankfurt). Tablolar `sofra` şemasında durur; ilk şema `prisma/migrations/0001_init` içinde.
- Tutarlar veritabanında **kuruş** cinsinden tam sayı tutulur. Sipariş fiyatları her zaman sunucuda veritabanından hesaplanır.
- Panel işlemleri Server Actions ile yapılır, her sorgu oturumdaki restorana göre filtrelenir.

| Klasör | İçerik |
|---|---|
| `src/app/(site)` | Tanıtım sitesi: ana sayfa, fiyatlar, nasıl çalışır, ücretsiz görünürlük raporu |
| `src/app/r/[slug]` | Restoranın sitesi, sepet, ödeme, sipariş takibi, PWA manifest |
| `src/app/panel` | Yönetim paneli |
| `src/app/api` | Sipariş oluşturma, iyzico dönüşü, AI asistan, cron |
| `src/lib/ai.ts`, `src/lib/assistant.ts` | Claude API (model: `claude-opus-5-5`) |
| `src/lib/payments/iyzico.ts` | iyzico Checkout Form (IYZWSv2 imza) |
| `src/lib/messaging.ts` | Netgsm SMS (İYS filtreli), Resend e-posta |

## Ortam değişkenleri

`.env.example` dosyasına bakın. Canlıya çıkarken en az `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` ve `CRON_SECRET` gerekli.
Otomatik kampanyalar için `/api/cron/otomasyonlar` uç noktasının günde bir kez `Authorization: Bearer $CRON_SECRET` ile çağrılması gerekir (`vercel.json` içinde Vercel Cron tanımlı).

## Canlı ortam (Vercel + Supabase)

- Vercel projesi GitHub'a bağlı: `main`'e her push canlıya çıkar, PR'lar önizleme alır. Fonksiyonlar Frankfurt (`fra1`) bölgesinde çalışır.
- Ortam değişkenleri Vercel proje ayarlarında tanımlı (`DATABASE_URL`, `SESSION_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`).
- Sağlık kontrolü: `GET /api/saglik`
- Demo restoranı oluşturmak/sıfırlamak: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://SITE/api/kurulum/demo`

## Yayına almadan önce

- KVKK metni (`/kvkk`) bir şablondur; hukuk danışmanınızla gözden geçirin ve VERBİS yükümlülüklerini kontrol edin.
- iyzico'da canlı üye işyeri başvurusu yapın ve `IYZICO_BASE_URL=https://api.iyzipay.com` olarak ayarlayın.
- Netgsm'de SMS başlığı onayı ve İYS marka kaydı gerekir.
