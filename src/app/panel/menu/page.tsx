import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { tl } from "@/lib/money";
import { aiEnabled } from "@/lib/ai";
import { aiImportMenu, createCategory, deleteCategory, deleteItem, toggleItem } from "../actions";
import { ItemForm } from "./ItemForm";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const user = await requireUser();
  const categories = await db.category.findMany({
    where: { restaurantId: user.restaurantId },
    orderBy: { sort: "asc" },
    include: { items: { orderBy: { sort: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Menü</h1>
        <form action={createCategory} className="flex gap-2">
          <input name="name" placeholder="Yeni kategori adı" className="input" required />
          <button className="btn-dark whitespace-nowrap">Kategori ekle</button>
        </form>
      </div>

      <details className="card">
        <summary className="cursor-pointer font-semibold">✨ Menüyü AI ile içe aktar</summary>
        <p className="mt-2 text-sm text-stone-600">
          Mevcut menünüzü (PDF&apos;ten, eski sitenizden ya da yemek platformundan) kopyalayıp yapıştırın. AI kategorileri, ürünleri, fiyatları
          ayırır ve eksik açıklamaları yazar.{!aiEnabled() && " (AI anahtarı tanımlı olmadığı için basit ayrıştırıcı kullanılır.)"}
        </p>
        <form action={aiImportMenu} className="mt-3 space-y-3">
          <textarea name="menu" rows={8} className="input font-mono" placeholder={"Çorbalar\nMercimek Çorbası 95\nEzogelin 95\n\nKebaplar\nAdana Kebap 385\n..."} />
          <SubmitButton className="btn-primary" pendingText="Menü ayrıştırılıyor…">İçe aktar</SubmitButton>
        </form>
      </details>

      {categories.map((c) => (
        <section key={c.id} className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{c.name}</h2>
            <form action={deleteCategory.bind(null, c.id)}>
              <button className="text-sm text-stone-400 hover:text-red-600">Kategoriyi sil</button>
            </form>
          </div>
          <div className="divide-y">
            {c.items.map((i) => (
              <details key={i.id} className="py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className={i.isAvailable ? "" : "text-stone-400 line-through"}>
                    {i.name} {i.isPopular && <span className="text-xs text-amber-700">· Popüler</span>}
                    {i.isUpsell && <span className="text-xs text-sky-700"> · Sepet önerisi</span>}
                  </span>
                  <span className="flex items-center gap-3 text-sm">
                    <strong>{tl(i.price)}</strong>
                    <form action={toggleItem.bind(null, i.id)}>
                      <button className={`rounded-full px-2 py-0.5 text-xs ${i.isAvailable ? "bg-green-100 text-green-800" : "bg-stone-200"}`}>
                        {i.isAvailable ? "Satışta" : "Tükendi"}
                      </button>
                    </form>
                  </span>
                </summary>
                <div className="mt-3">
                  <ItemForm categoryId={c.id} item={{ ...i, price: (i.price / 100).toFixed(2).replace(".", ",") }} />
                  <form action={deleteItem.bind(null, i.id)} className="mt-2">
                    <button className="text-sm text-red-600">Ürünü sil</button>
                  </form>
                </div>
              </details>
            ))}
          </div>
          <details className="mt-3 border-t pt-3">
            <summary className="cursor-pointer text-sm font-semibold text-brand">+ Ürün ekle</summary>
            <div className="mt-3">
              <ItemForm categoryId={c.id} />
            </div>
          </details>
        </section>
      ))}
    </div>
  );
}
