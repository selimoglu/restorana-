import Link from "next/link";
import { PhoneMockup } from "./PhoneMockup";

export function ClosingCta() {
  return (
    <section className="ink-gradient overflow-hidden text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Restoranınızın satışlarını büyütmenin en kolay yolu.</h2>
          <p className="mt-5 max-w-lg text-lg text-white/75">
            Kurulumu biz yapalım, siz mutfağa odaklanın. İlk siparişinizi çoğu zaman aynı gün alırsınız.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/kayit" className="btn-site-light px-6 py-3.5 text-base">Ücretsiz başla</Link>
            <Link href="/nasil-calisir" className="inline-flex items-center rounded-full border border-white/30 px-6 py-3.5 text-base font-semibold hover:bg-white/10">
              Nasıl çalışır?
            </Link>
          </div>
        </div>
        <div className="relative">
          <PhoneMockup variant="rewards" />
        </div>
      </div>
    </section>
  );
}
