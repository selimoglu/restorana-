"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/panel", "Özet"],
  ["/panel/siparisler", "Siparişler"],
  ["/panel/mutfak", "Mutfak ekranı"],
  ["/panel/menu", "Menü"],
  ["/panel/musteriler", "Müşteriler & sadakat"],
  ["/panel/kampanyalar", "Kampanyalar"],
  ["/panel/yorumlar", "Yorumlar"],
  ["/panel/asistan", "AI asistan"],
  ["/panel/ayarlar", "Ayarlar & site"],
] as const;

export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3">
      {LINKS.map(([href, label]) => {
        const active = href === "/panel" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
