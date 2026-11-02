import type { Metadata } from "next";
import { Grader } from "./Grader";

export const metadata: Metadata = { title: "Ücretsiz restoran raporu" };

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ ad?: string }> }) {
  const { ad } = await searchParams;
  return (
    <section className="hero-gradient min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="eyebrow">Ücretsiz rapor</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {ad ? `${ad} internette ne kadar görünür?` : "Restoranınız internette ne kadar görünür?"}
        </h1>
        <p className="mt-4 text-lg text-stone-700">8 kısa soruyu yanıtlayın, puanınızı ve size özel önerileri hemen görün.</p>
        <Grader name={ad ?? ""} />
      </div>
    </section>
  );
}
