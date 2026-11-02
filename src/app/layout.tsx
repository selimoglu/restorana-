import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: `${BRAND.name} | ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description:
    "Komisyonsuz online sipariş, AI ile hazırlanan restoran web sitesi, sadakat programı ve otomatik pazarlama. Türkiye'deki restoranlar için.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        <style
          // Marka renkleri src/lib/brand.ts dosyasından gelir.
          dangerouslySetInnerHTML={{
            __html: `:root{--site-primary:${BRAND.colors.primary};--site-primary-dark:${BRAND.colors.primaryDark};--site-ink:${BRAND.colors.ink};--site-soft:${BRAND.colors.soft};--site-accent:${BRAND.colors.accent}}`,
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
