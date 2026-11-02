import Link from "next/link";
import { BRAND, PRODUCT_GROUPS } from "@/lib/brand";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-site text-base text-white">{BRAND.name.charAt(0)}</span>
      {BRAND.name}
    </Link>
  );
}

const NAV = [
  ["Fiyatlar", "/fiyatlar"],
  ["Nasıl çalışır", "/nasil-calisir"],
  ["Ücretsiz rapor", "/rapor"],
  ["Örnek site", "/r/lezzet-duragi"],
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm font-semibold text-ink lg:flex">
          <div className="group relative">
            <button className="rounded-full px-3 py-2 hover:bg-soft">Ürün ▾</button>
            <div className="invisible absolute left-1/2 top-full w-[760px] -translate-x-1/2 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-2 rounded-3xl border border-ink/10 bg-white p-4 shadow-2xl">
                {PRODUCT_GROUPS.map((g) => (
                  <Link key={g.id} href={`/#${g.id}`} className="rounded-2xl p-4 hover:bg-soft">
                    <p className="font-bold text-ink">{g.title}</p>
                    <p className="mt-1 text-xs font-normal text-stone-600">{g.items.map((i) => i[0]).join(" · ")}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 hover:bg-soft">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/giris" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-soft sm:inline-flex">
            Giriş
          </Link>
          <Link href="/kayit" className="btn-site py-2.5">
            Ücretsiz başla
          </Link>
          <details className="relative lg:hidden">
            <summary className="list-none rounded-full border border-ink/15 px-3 py-2 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              Menü
            </summary>
            <div className="absolute right-0 top-full mt-2 w-72 space-y-1 rounded-2xl border border-ink/10 bg-white p-3 text-sm shadow-2xl">
              {PRODUCT_GROUPS.map((g) => (
                <Link key={g.id} href={`/#${g.id}`} className="block rounded-xl px-3 py-2 font-semibold text-ink hover:bg-soft">
                  {g.title}
                </Link>
              ))}
              <hr className="my-2 border-ink/10" />
              {NAV.map(([label, href]) => (
                <Link key={href} href={href} className="block rounded-xl px-3 py-2 font-semibold text-ink hover:bg-soft">
                  {label}
                </Link>
              ))}
              <Link href="/giris" className="block rounded-xl px-3 py-2 font-semibold text-ink hover:bg-soft">
                Giriş
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
