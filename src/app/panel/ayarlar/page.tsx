import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { DAYS, parseHours } from "@/lib/restaurant";
import { saveSettings } from "../actions";
import { WebsiteCopyFields } from "./WebsiteCopyFields";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const money = (k: number) => (k / 100).toFixed(2).replace(".", ",");

export default async function SettingsPage() {
  const user = await requireUser();
  const r = user.restaurant;
  const hours = parseHours(r.openingHours);
  const siteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/r/${r.slug}`;
  const qr = await QRCode.toString(siteUrl, { type: "svg", margin: 1, width: 200 });

  return (
    <form action={saveSettings} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ayarlar & web sitesi</h1>
        <SubmitButton className="btn-primary">Kaydet</SubmitButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card space-y-3 lg:col-span-2">
          <h2 className="font-semibold">Web sitesi</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Restoran adı" name="name" value={r.name} />
            <Field label="Mutfak türü" name="cuisine" value={r.cuisine} placeholder="Kebap, pizza, ev yemekleri…" />
          </div>
          <WebsiteCopyFields tagline={r.tagline} about={r.about} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kapak görseli (URL)" name="heroImageUrl" value={r.heroImageUrl} />
            <div>
              <label className="label">Marka rengi</label>
              <input type="color" name="primaryColor" defaultValue={r.primaryColor} className="h-10 w-full rounded-xl border border-stone-300" />
            </div>
          </div>
        </section>

        <section className="card text-center">
          <h2 className="mb-1 font-semibold">QR menü & uygulama</h2>
          <p className="mb-3 text-xs text-stone-500">Masalara koyun. Müşteriler telefonda “Ana ekrana ekle” ile sitenizi uygulama gibi kurabilir.</p>
          <div className="mx-auto w-48" dangerouslySetInnerHTML={{ __html: qr }} />
          <a href={siteUrl} target="_blank" className="mt-2 block break-all text-sm text-brand underline">
            {siteUrl}
          </a>
        </section>
      </div>

      <section className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="font-semibold sm:col-span-2 lg:col-span-3">İletişim & konum</h2>
        <Field label="Telefon" name="phone" value={r.phone} />
        <Field label="WhatsApp (90 ile)" name="whatsapp" value={r.whatsapp} placeholder="905xxxxxxxxx" />
        <Field label="Instagram" name="instagram" value={r.instagram} placeholder="kullaniciadi" />
        <Field label="Adres" name="address" value={r.address} />
        <Field label="İlçe" name="district" value={r.district} />
        <Field label="İl" name="city" value={r.city} />
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Google yorum bağlantısı" name="googleReviewUrl" value={r.googleReviewUrl} placeholder="https://g.page/r/…/review" />
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Çalışma saatleri</h2>
        <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {DAYS.map(([k, label]) => (
            <Field key={k} label={label} name={`h_${k}`} value={hours[k] ?? ""} placeholder="11:00-23:00" />
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-500">Boş bırakılan gün kapalı sayılır. Gece yarısını geçen saatler için ör. 18:00-02:00 yazın.</p>
      </section>

      <section className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <h2 className="font-semibold sm:col-span-2 lg:col-span-4">Sipariş & teslimat</h2>
        <Check label="Gel-al" name="pickupEnabled" checked={r.pickupEnabled} />
        <Check label="Paket servis" name="deliveryEnabled" checked={r.deliveryEnabled} />
        <Check label="Online ödeme (iyzico)" name="onlinePayment" checked={r.onlinePayment} />
        <Check label="Kapıda kart" name="cardOnDelivery" checked={r.cardOnDelivery} />
        <Check label="Kapıda nakit" name="cashOnDelivery" checked={r.cashOnDelivery} />
        <Field label="Teslimat ücreti (TL)" name="deliveryFee" value={money(r.deliveryFee)} />
        <Field label="Ücretsiz teslimat alt limiti (TL)" name="freeDeliveryMin" value={money(r.freeDeliveryMin)} />
        <Field label="Minimum sipariş (TL)" name="minOrder" value={money(r.minOrder)} />
        <Field label="Hazırlık süresi (dk)" name="prepMinutes" value={String(r.prepMinutes)} />
        <Field label="Sadakat puanı (%)" name="loyaltyPercent" value={String(r.loyaltyPercent)} />
      </section>
    </form>
  );
}

function Field({ label, name, value, placeholder }: { label: string; name: string; value: string; placeholder?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} defaultValue={value} placeholder={placeholder} className="input" />
    </div>
  );
}

function Check({ label, name, checked }: { label: string; name: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4" /> {label}
    </label>
  );
}
