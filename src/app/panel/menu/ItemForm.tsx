"use client";

import { useRef, useState, useTransition } from "react";
import { aiDescribeItem, saveItem } from "../actions";

interface Item {
  id: string;
  name: string;
  description: string;
  price: string;
  allergens: string;
  imageUrl: string;
  isPopular: boolean;
  isUpsell: boolean;
}

export function ItemForm({ categoryId, item }: { categoryId: string; item?: Item }) {
  const [desc, setDesc] = useState(item?.description ?? "");
  const nameRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (f) => {
        await saveItem(f);
        if (!item) {
          formRef.current?.reset();
          setDesc("");
        }
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <div>
        <label className="label">Ürün adı</label>
        <input ref={nameRef} name="name" defaultValue={item?.name} required className="input" />
      </div>
      <div>
        <label className="label">Fiyat (TL)</label>
        <input name="price" defaultValue={item?.price} required inputMode="decimal" className="input" placeholder="125,00" />
      </div>
      <div className="sm:col-span-2">
        <div className="mb-1 flex items-center justify-between">
          <label className="label mb-0">Açıklama</label>
          <button
            type="button"
            disabled={pending}
            className="text-sm font-semibold text-brand"
            onClick={() =>
              start(async () => {
                const name = nameRef.current?.value;
                if (name) setDesc(await aiDescribeItem(name, desc));
              })
            }
          >
            {pending ? "Yazılıyor…" : "✨ AI ile yaz"}
          </button>
        </div>
        <textarea name="description" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="input" />
      </div>
      <div>
        <label className="label">Alerjenler</label>
        <input name="allergens" defaultValue={item?.allergens} className="input" placeholder="Gluten, süt, susam…" />
      </div>
      <div>
        <label className="label">Görsel adresi (URL)</label>
        <input name="imageUrl" defaultValue={item?.imageUrl} className="input" placeholder="https://…" />
      </div>
      <div className="flex flex-wrap gap-4 text-sm sm:col-span-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isPopular" defaultChecked={item?.isPopular} /> Popüler olarak öne çıkar
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isUpsell" defaultChecked={item?.isUpsell} /> Sepette “yanına iyi gider” olarak öner
        </label>
      </div>
      <div className="sm:col-span-2">
        <button className="btn-dark">{item ? "Kaydet" : "Ürünü ekle"}</button>
      </div>
    </form>
  );
}
