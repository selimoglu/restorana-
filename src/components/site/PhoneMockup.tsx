// Telefon ekranında örnek bir restoran uygulaması: tamamen CSS, görsel dosyası yok.
export function PhoneMockup({ variant = "store" }: { variant?: "store" | "rewards" }) {
  return (
    <div className="relative mx-auto w-[260px] rounded-[44px] bg-stone-900 p-3 shadow-2xl ring-1 ring-black/10">
      <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-stone-900" />
      <div className="overflow-hidden rounded-[34px] bg-white">
        <div className="h-36 bg-gradient-to-br from-orange-400 via-rose-500 to-amber-600 p-4 pt-8 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Online sipariş</p>
          <p className="mt-1 text-xl font-extrabold leading-tight">Lezzet Durağı</p>
          <span className="mt-2 inline-block rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-stone-900">Sipariş ver</span>
        </div>
        {variant === "rewards" ? (
          <div className="space-y-3 p-4">
            <div className="rounded-2xl bg-ink p-4 text-white">
              <p className="text-[11px] opacity-70">Puanınız</p>
              <p className="text-2xl font-extrabold">₺86,50</p>
              <div className="mt-2 h-2 rounded-full bg-white/20">
                <div className="h-2 w-2/3 rounded-full bg-accent" />
              </div>
              <p className="mt-1 text-[10px] opacity-70">Ücretsiz künefeye ₺43,50 kaldı</p>
            </div>
            {["Adana Dürüm", "Lahmacun", "Ayran"].map((n, i) => (
              <div key={n} className="flex items-center justify-between rounded-xl border border-stone-200 p-2.5 text-[11px]">
                <span className="font-semibold">{n}</span>
                <span className="text-stone-500">₺{[240, 90, 35][i]}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5 p-4">
            <p className="text-xs font-bold">En çok sevilenler</p>
            {[
              ["İskender", "₺380", "from-amber-300 to-orange-500"],
              ["Karışık Pide", "₺290", "from-yellow-200 to-amber-500"],
              ["Künefe", "₺160", "from-orange-200 to-rose-400"],
            ].map(([n, p, g]) => (
              <div key={n} className="flex items-center gap-2.5 rounded-xl border border-stone-200 p-2">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${g}`} />
                <div className="flex-1 text-[11px]">
                  <p className="font-semibold">{n}</p>
                  <p className="text-stone-500">{p}</p>
                </div>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-stone-900 text-xs text-white">+</span>
              </div>
            ))}
            <div className="rounded-xl bg-soft p-2.5 text-[10px] font-semibold text-ink">Her siparişte %5 puan kazanın</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ScoreCard({ score = 36 }: { score?: number }) {
  const color = score >= 70 ? "#16a34a" : score >= 45 ? "#d97706" : "#dc2626";
  return (
    <div className="w-56 rounded-3xl bg-white p-4 shadow-xl ring-1 ring-black/5">
      <p className="text-xs font-semibold text-stone-500">Online görünürlük puanı</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e7e5e4 0)` }}>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg font-extrabold">{score}</div>
        </div>
        <div className="text-[11px] leading-tight text-stone-600">
          <p>✕ Online sipariş yok</p>
          <p>✕ Google&apos;da 3. sayfa</p>
          <p className="text-green-700">✓ Menü güncel</p>
        </div>
      </div>
    </div>
  );
}
