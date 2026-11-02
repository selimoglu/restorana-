"use client";

import { useState, useTransition } from "react";
import { aiWriteCampaign, saveCampaign } from "../actions";

export function CampaignComposer({ audiences, counts }: { audiences: Record<string, string>; counts: Record<string, number> }) {
  const [channel, setChannel] = useState("SMS");
  const [audience, setAudience] = useState("LAPSED");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  return (
    <form
      action={async (f) => {
        await saveCampaign(f);
        setMessage("");
        setGoal("");
      }}
      className="card space-y-3"
    >
      <h2 className="font-semibold">Yeni kampanya</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Kampanya adı</label>
          <input name="name" className="input" placeholder="Hafta sonu lahmacun" />
        </div>
        <div>
          <label className="label">Kanal</label>
          <select name="channel" value={channel} onChange={(e) => setChannel(e.target.value)} className="input">
            <option value="SMS">SMS</option>
            <option value="EMAIL">E-posta</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
        <div>
          <label className="label">Hedef kitle</label>
          <select name="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="input">
            {Object.entries(audiences).map(([k, v]) => (
              <option key={k} value={k}>
                {v} ({counts[k] ?? 0})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Amaç (AI için)</label>
        <div className="flex gap-2">
          <input value={goal} onChange={(e) => setGoal(e.target.value)} className="input" placeholder="Ör. Pazar günü lahmacunda 2 al 1 öde, kod: PAZAR" />
          <button
            type="button"
            disabled={pending}
            className="btn-dark whitespace-nowrap"
            onClick={() => start(async () => setMessage(await aiWriteCampaign(goal, channel, audience)))}
          >
            {pending ? "Yazılıyor…" : "✨ AI ile yaz"}
          </button>
        </div>
      </div>
      <div>
        <label className="label">Mesaj</label>
        <textarea name="message" required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input" />
        <p className="mt-1 text-xs text-stone-500">
          {"{ad}"} müşterinin adıyla, {"{link}"} sipariş sayfanızla değiştirilir. {channel === "SMS" && `${message.length} karakter`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select name="automation" className="input w-auto">
          <option value="">Tek seferlik (taslak olarak kaydet)</option>
          <option value="WIN_BACK">Otomatik: 14 gün sipariş vermeyene</option>
          <option value="FIRST_ORDER_THANKS">Otomatik: ilk sipariş sonrası</option>
        </select>
        <button className="btn-primary">Kaydet</button>
      </div>
    </form>
  );
}
