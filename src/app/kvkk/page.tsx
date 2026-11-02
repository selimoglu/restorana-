import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

// Şablon metindir; yayına almadan önce hukuk danışmanınızla gözden geçirin.
export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-xl font-extrabold">{BRAND.name}</Link>
      <h1 className="mt-6 text-3xl font-bold">Kişisel Verilerin Korunması Aydınlatma Metni</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-stone-700">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında, sipariş verdiğiniz restoran veri sorumlusu, {BRAND.name} ise
          veri işleyen sıfatıyla hareket eder.
        </p>
        <h2 className="text-xl font-semibold text-stone-900">İşlenen veriler</h2>
        <p>Ad soyad, cep telefonu, e-posta (isteğe bağlı), teslimat adresi, sipariş içeriği ve ödeme durumu. Kart bilgileriniz {BRAND.name} veya restoran tarafından saklanmaz; ödeme kuruluşu (iyzico) tarafından işlenir.</p>
        <h2 className="text-xl font-semibold text-stone-900">İşleme amaçları ve hukuki sebep</h2>
        <p>
          Siparişinizin alınması, hazırlanması, teslim edilmesi ve bilgilendirme mesajlarının gönderilmesi (KVKK m.5/2-c, sözleşmenin ifası);
          sadakat puanlarının hesaplanması; yasal yükümlülüklerin yerine getirilmesi (m.5/2-ç). Kampanya ve tanıtım iletileri yalnızca ayrıca
          vereceğiniz açık onay ile ve İleti Yönetim Sistemi (İYS) kaydına uygun şekilde gönderilir.
        </p>
        <h2 className="text-xl font-semibold text-stone-900">Aktarım</h2>
        <p>Verileriniz siparişin ifası için ödeme kuruluşu, SMS/e-posta hizmet sağlayıcıları ve barındırma hizmeti sağlayıcılarıyla, amaçla sınırlı olarak paylaşılır.</p>
        <h2 className="text-xl font-semibold text-stone-900">Haklarınız</h2>
        <p>
          KVKK m.11 kapsamında verilerinize erişme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve ticari ileti onayınızı
          dilediğiniz zaman geri alma hakkına sahipsiniz. Talepleriniz için restorana veya {BRAND.supportEmail} adresine başvurabilirsiniz.
        </p>
      </div>
    </div>
  );
}
