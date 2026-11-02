"use client";

import { useState } from "react";

interface Turn {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Bu hafta geçen haftaya göre nasıl gidiyoruz?",
  "En az satan ürünlerim hangileri, ne yapmalıyım?",
  "Kaybetmek üzere olduğum müşteriler için bir SMS kampanyası taslağı hazırla",
  "Akşam yoğunluğu için hangi saatlerde daha fazla personel gerekir?",
];

export function Chat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const history = [...turns, { role: "user" as const, text }];
    setTurns(history);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/asistan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      setTurns([...history, { role: "assistant", text: data.text ?? data.error ?? "Bir hata oluştu." }]);
    } catch {
      setTurns([...history, { role: "assistant", text: "Bağlantı hatası, tekrar deneyin." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex min-h-[60vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {turns.length === 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-xl border border-stone-200 p-3 text-left text-sm hover:bg-stone-50">
                {s}
              </button>
            ))}
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={t.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${t.role === "user" ? "bg-stone-900 text-white" : "bg-stone-100"}`}>
              {t.text}
            </div>
          </div>
        ))}
        {busy && <p className="text-sm text-stone-500">Verilerinize bakıyor…</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2 border-t pt-4"
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="Bir soru sorun…" />
        <button disabled={busy} className="btn-primary">
          Gönder
        </button>
      </form>
    </div>
  );
}
