export function FaqList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white">
      {items.map(([q, a]) => (
        <details key={q} className="group p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
            {q}
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-soft transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-stone-600">{a}</p>
        </details>
      ))}
    </div>
  );
}

export const FAQ = [
  ["Yemek platformlarını bırakmam gerekiyor mu?", "Hayır. Platformlar yeni müşteri bulmak için faydalı. Amaç, sizi zaten tanıyan müşterilerin siparişlerini komisyonsuz kendi kanalınıza taşımak."],
  ["Kuryem yok, paket servis yapabilir miyim?", "Sadece gel-al ile başlayabilirsiniz. Kendi kuryeniz varsa teslimat ücretini, bölgeyi ve minimum tutarı siz belirlersiniz."],
  ["Ödemeler ne zaman hesabıma geçer?", "Online ödemeler iyzico üzerinden alınır ve iyzico'nun standart takvimiyle hesabınıza aktarılır. Kapıda ödemeler doğrudan sizindir."],
  ["KVKK ve İYS konusunda ne yapmam gerekiyor?", "Sipariş ekranında aydınlatma metni ve ticari ileti onayı ayrı ayrı alınır. Kampanyalar yalnızca onay veren müşterilere gönderilir."],
  ["Kurulum ne kadar sürer?", "Menünüzü yapıştırdığınızda siteniz birkaç dakikada hazır olur. Ekibimiz menü ve fotoğraf taşıma işini de ücretsiz yapar."],
  ["Taahhüt var mı?", "Hayır. Aylık ödersiniz, istediğiniz zaman iptal edersiniz."],
] as const;
