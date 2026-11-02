"use client";

import { useState } from "react";

export function CommissionCalculator() {
  const [orders, setOrders] = useState(600);
  const [basket, setBasket] = useState(450);
  const [rate, setRate] = useState(25);
  const [share, setShare] = useState(40);
  const monthly = orders * basket * (rate / 100);
  const saved = monthly * (share / 100);
  const fmt = (n: number) => "₺" + Math.round(n).toLocaleString("tr-TR");

  return (
    <div className="card space-y-4">
      <Slider label="Aylık platform siparişi" value={orders} min={50} max={3000} step={50} onChange={setOrders} suffix=" adet" />
      <Slider label="Ortalama sepet" value={basket} min={100} max={2000} step={25} onChange={setBasket} prefix="₺" />
      <Slider label="Komisyon + hizmet bedeli" value={rate} min={10} max={40} step={1} onChange={setRate} prefix="%" />
      <Slider label="Kendi kanalınıza taşınan sipariş oranı" value={share} min={10} max={80} step={5} onChange={setShare} prefix="%" />
      <div className="rounded-xl bg-ink p-4 text-white">
        <p className="text-sm text-white/70">Şu an platforma ödediğiniz: {fmt(monthly)} / ay</p>
        <p className="mt-1 text-2xl font-bold">Tahmini tasarruf: {fmt(saved)} / ay</p>
        <p className="text-sm text-white/70">Yılda yaklaşık {fmt(saved * 12)}</p>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, onChange, prefix = "", suffix = "",
}: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; prefix?: string; suffix?: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm">
        <span>{label}</span>
        <strong>
          {prefix}
          {value.toLocaleString("tr-TR")}
          {suffix}
        </strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-site" />
    </label>
  );
}
