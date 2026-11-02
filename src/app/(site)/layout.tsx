import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-ink">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
