import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { logout } from "./actions";
import { NavLinks } from "./NavLinks";

export const metadata: Metadata = { title: "Yönetim paneli", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const r = user.restaurant;
  return (
    <div className="min-h-screen md:flex" style={{ ["--brand" as string]: r.primaryColor }}>
      <aside className="border-b border-stone-200 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-4 md:block">
          <Link href="/panel" className="text-lg font-extrabold">
            {BRAND.name}
          </Link>
          <p className="truncate text-sm text-stone-500 md:mt-1">{r.name}</p>
        </div>
        <NavLinks />
        <div className="hidden space-y-2 p-4 text-sm md:block">
          <Link href={`/r/${r.slug}`} target="_blank" className="btn-ghost w-full">
            Siteyi görüntüle ↗
          </Link>
          <form action={logout}>
            <button className="w-full text-stone-500 hover:text-stone-800">Çıkış yap</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
