import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AUDIENCES } from "@/lib/campaigns";
import { deleteCampaign, sendCampaign, toggleAutomation } from "../actions";
import { CampaignComposer } from "./CampaignComposer";

export const dynamic = "force-dynamic";

const CHANNEL: Record<string, string> = { SMS: "SMS", EMAIL: "E-posta", WHATSAPP: "WhatsApp" };
const AUTOMATION: Record<string, string> = {
  WIN_BACK: "14 gün sipariş vermeyene otomatik gönderilir",
  FIRST_ORDER_THANKS: "İlk siparişten sonra otomatik gönderilir",
};

export default async function CampaignsPage() {
  const user = await requireUser();
  const campaigns = await db.campaign.findMany({ where: { restaurantId: user.restaurantId }, orderBy: { createdAt: "desc" } });
  const counts = Object.fromEntries(
    await Promise.all(
      Object.keys(AUDIENCES).map(async (a) => {
        const where =
          a === "LAPSED"
            ? { lastOrderAt: { lt: new Date(Date.now() - 14 * 86400000) } }
            : a === "VIP"
              ? { orderCount: { gte: 5 } }
              : a === "NEW"
                ? { orderCount: { lte: 1 } }
                : {};
        return [a, await db.customer.count({ where: { restaurantId: user.restaurantId, marketingConsent: true, ...where } })] as const;
      }),
    ),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kampanyalar</h1>
        <p className="text-sm text-stone-500">
          Mesajlar yalnızca ticari ileti onayı (İYS) vermiş müşterilere gönderilir. SMS gönderimleri İYS filtresiyle yapılır.
        </p>
      </div>
      <CampaignComposer audiences={AUDIENCES} counts={counts} />
      <section className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-stone-500">
                  {CHANNEL[c.channel]} · {AUDIENCES[c.audience]} ({counts[c.audience] ?? 0} kişi)
                  {c.automation && ` · ${AUTOMATION[c.automation] ?? "Otomatik"}`}
                </p>
              </div>
              <div className="flex gap-2">
                {c.automation ? (
                  <form action={toggleAutomation.bind(null, c.id)}>
                    <button className={c.status === "ACTIVE" ? "btn-ghost text-green-700" : "btn-ghost"}>
                      {c.status === "ACTIVE" ? "● Aktif" : "○ Durduruldu"}
                    </button>
                  </form>
                ) : c.status === "SENT" ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">{c.sentCount} kişiye gönderildi</span>
                ) : (
                  <form action={sendCampaign.bind(null, c.id)}>
                    <button className="btn-primary">Şimdi gönder</button>
                  </form>
                )}
                <form action={deleteCampaign.bind(null, c.id)}>
                  <button className="btn-ghost text-stone-500" aria-label="Sil">
                    Sil
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line rounded-xl bg-stone-50 p-3 text-sm">{c.message}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
