import Link from "next/link";
import type { Metadata } from "next";
import { INCLUDED, PLANS, SERVICES } from "@/lib/brand";
import { ClosingCta } from "@/components/site/ClosingCta";
import { FAQ, FaqList } from "../FaqList";

export const metadata: Metadata = { title: "Fiyatlar" };

export default function PricingPage() {
  return (
    <>
      <section className="hero-gradient">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 text-center">
          <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">Restoranınıza uyan sade fiyatlar</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-700">Kurulum ücreti yok, taahhüt yok. Fiyatlara KDV dahil değildir.</p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 text-left md:grid-cols-2">
            {PLANS.map((p) => (
              <div key={p.id} className={`relative flex flex-col rounded-[32px] bg-white p-8 shadow-xl ${p.highlight ? "ring-2 ring-site" : "ring-1 ring-ink/10"}`}>
                {p.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">En avantajlı</span>
                )}
                <h2 className="text-2xl font-extrabold text-ink">{p.name}</h2>
                <p className="mt-1 text-stone-600">{p.desc}</p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-ink">₺{p.price.toLocaleString("tr-TR")}</span>
                  <span className="text-stone-500"> / ay</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-site">{p.fee}</p>
                <Link href="/kayit" className={`${p.highlight ? "btn-site" : "btn-site-outline"} mt-8`}>
                  Ücretsiz başla
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2">
          <div>
            <h2 className="site-h2">Tüm paketlerde dahil</h2>
            <p className="mt-4 text-lg text-stone-600">Hangi paketi seçerseniz seçin, platformun tamamını kullanırsınız.</p>
          </div>
          <div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {INCLUDED.map((f) => (
                <li key={f} className="flex gap-3 rounded-2xl bg-soft p-4 font-semibold text-ink">
                  <span className="text-site">✓</span> {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {SERVICES.map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-ink/10 p-4">
                  <p className="font-bold text-ink">{t}</p>
                  <p className="mt-1 text-sm text-stone-600">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="site-h2 mb-10 text-center">Sık sorulan sorular</h2>
          <FaqList items={FAQ} />
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
