import Link from "next/link";
import { BRAND, PRODUCT_GROUPS } from "@/lib/brand";
import { Logo } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm">{BRAND.tagline}. Türkiye&apos;deki restoranlar için.</p>
        </div>
        {PRODUCT_GROUPS.slice(0, 3).map((g) => (
          <div key={g.id}>
            <p className="mb-3 text-sm font-bold text-white">{g.title}</p>
            <ul className="space-y-2 text-sm">
              {g.items.map(([t]) => (
                <li key={t}>
                  <Link href={`/#${g.id}`} className="hover:text-white">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="mb-3 text-sm font-bold text-white">Destek</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:${BRAND.supportPhone.replace(/\s/g, "")}`} className="hover:text-white">
                {BRAND.supportPhone}
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-white">
                {BRAND.supportEmail}
              </a>
            </li>
            <li><Link href="/fiyatlar" className="hover:text-white">Fiyatlar</Link></li>
            <li><Link href="/nasil-calisir" className="hover:text-white">Nasıl çalışır</Link></li>
            <li><Link href="/rapor" className="hover:text-white">Ücretsiz restoran raporu</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-6 text-xs">
          <p>© {new Date().getFullYear()} {BRAND.name}. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href="/kvkk" className="hover:text-white">KVKK Aydınlatma Metni</Link>
            <Link href="/giris" className="hover:text-white">Restoran girişi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
