"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "../auth-actions";
import { BRAND } from "@/lib/brand";

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin", "Eskişehir", "Kayseri", "Samsun", "Trabzon", "Diyarbakır", "Muğla", "Diğer"];

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, {});
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-xl font-extrabold">
        {BRAND.name}
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Restoranınızın sitesi 5 dakikada hazır</h1>
      <p className="mt-2 text-stone-600">
        Bilgilerinizi girin, menünüzü yapıştırın. Yapay zekâ sitenizi, menü açıklamalarınızı ve sipariş sayfanızı hazırlasın.
      </p>
      <form action={action} className="card mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Adınız soyadınız" name="ownerName" />
        <Input label="E-posta" name="email" type="email" />
        <Input label="Şifre (en az 8 karakter)" name="password" type="password" />
        <Input label="Telefon" name="phone" required={false} />
        <Input label="Restoran adı" name="restaurantName" />
        <Input label="Mutfak türü" name="cuisine" placeholder="Kebap, pide, burger, kahvaltı…" required={false} />
        <div>
          <label className="label" htmlFor="city">İl</label>
          <select id="city" name="city" className="input" defaultValue="İstanbul">
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <Input label="İlçe" name="district" placeholder="Kadıköy" required={false} />
        <div className="sm:col-span-2">
          <label className="label" htmlFor="menu">Menünüz (isteğe bağlı)</label>
          <textarea
            id="menu"
            name="menu"
            rows={6}
            className="input font-mono"
            placeholder={"Mevcut menünüzü buraya yapıştırın, AI kategori/ürün/fiyat olarak ayırsın.\n\nÇorbalar\nMercimek 95\n…"}
          />
        </div>
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="terms" required className="mt-1 h-4 w-4" />
          <span>
            Kullanım koşullarını ve <Link href="/kvkk" className="underline" target="_blank">KVKK Aydınlatma Metni</Link>&apos;ni okudum, kabul ediyorum.
          </span>
        </label>
        {state.error && <p className="text-sm text-red-700 sm:col-span-2">{state.error}</p>}
        <button disabled={pending} className="btn-dark py-3 sm:col-span-2">
          {pending ? "Siteniz hazırlanıyor… (bu biraz sürebilir)" : "Ücretsiz deneme başlat"}
        </button>
        <p className="text-center text-xs text-stone-500 sm:col-span-2">14 gün ücretsiz · Kredi kartı gerekmez</p>
      </form>
    </div>
  );
}

function Input({ label, name, type = "text", placeholder, required = true }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} required={required} className="input" />
    </div>
  );
}
