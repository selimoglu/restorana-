import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { ClosingCta } from "@/components/site/ClosingCta";

export const metadata: Metadata = { title: "Nasıl çalışır" };

const STEPS = [
  ["Hesabınızı açın", "Restoran bilgilerinizi girin. Kredi kartı istemiyoruz, ilk 14 gün ücretsiz.", "5 dakika"],
  ["Menünüzü yapıştırın", "PDF'ten, eski sitenizden ya da platformdan kopyalayın. Yapay zekâ kategorileri, fiyatları ve açıklamaları düzenler.", "2 dakika"],
  ["Sitenizi yayına alın", "Siteniz, sipariş sayfanız ve markalı uygulamanız hazır. Renk ve görselleri panelden değiştirin.", "Aynı gün"],
  ["Müşterilerinize duyurun", "Instagram biyografinize, Google işletme profilinize ve masalara QR olarak ekleyin. Paket poşetine kart koyun.", "İlk hafta"],
  ["Gerisini otomatiğe bırakın", "Siparişler panele ve mutfak ekranına düşer; sadakat puanı, kampanyalar ve yorum istekleri kendiliğinden işler.", "Her gün"],
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="hero-gradient">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16">
          <p className="eyebrow">Nasıl çalışır</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">Bugün başlayın, bu akşam ilk siparişi alın.</h1>
          <p className="mt-5 max-w-xl text-lg text-stone-700">
            {BRAND.name} kurulumu teknik bilgi gerektirmez. Takıldığınız her adımda ekibimiz telefonda.
          </p>
        </div>
      </section>
      <section className="py-20">
        <ol className="mx-auto max-w-4xl space-y-4 px-4">
          {STEPS.map(([t, d, time], i) => (
            <li key={t} className="flex gap-6 rounded-[32px] border border-ink/10 p-6 sm:p-8">
              <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-ink text-2xl font-extrabold text-accent">{i + 1}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-2xl font-extrabold text-ink">{t}</h2>
                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-site">{time}</span>
                </div>
                <p className="mt-2 text-stone-600">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link href="/kayit" className="btn-site px-6 py-3.5 text-base">Ücretsiz başla</Link>
        </div>
      </section>
      <ClosingCta />
    </>
  );
}
