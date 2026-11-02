import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReplyForm } from "./ReplyForm";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short" });

export default async function ReviewsPage() {
  const user = await requireUser();
  const reviews = await db.review.findMany({ where: { restaurantId: user.restaurantId }, orderBy: { createdAt: "desc" } });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yorumlar</h1>
        <p className="text-sm text-stone-500">
          Ortalama {avg.toFixed(1)} / 5 · {reviews.length} yorum. Sipariş teslim edilince müşteriden puan istenir; 4-5 yıldız verenler Google&apos;a
          yönlendirilir, düşük puanlar size özel kalır.
        </p>
        {!user.restaurant.googleReviewUrl && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Google yorum bağlantınızı <a href="/panel/ayarlar" className="underline">Ayarlar</a>&apos;dan ekleyin ki memnun müşteriler Google&apos;da da yorum bıraksın.
          </p>
        )}
      </div>
      {reviews.map((r) => (
        <div key={r.id} className="card">
          <div className="flex justify-between">
            <p className="font-semibold">
              {r.customerName} <span className="text-amber-500">{"★".repeat(r.rating)}</span>
              <span className="text-stone-300">{"★".repeat(5 - r.rating)}</span>
            </p>
            <span className="text-sm text-stone-500">
              {date.format(r.createdAt)} {!r.isPublic && "· Özel geri bildirim"}
            </span>
          </div>
          {r.comment && <p className="mt-2 text-stone-700">{r.comment}</p>}
          <ReplyForm id={r.id} reply={r.reply} />
        </div>
      ))}
    </div>
  );
}
