"use client";

import Link from "next/link";
import { useState } from "react";

const QUESTIONS = [
  { id: "site", q: "Kendi web siteniz var mı?", w: 15, tip: "Kendi siteniz olmadan Google'da sizi arayan müşteri platforma gider. AI ile birkaç dakikada site kurabilirsiniz." },
  { id: "order", q: "Sitenizden komisyonsuz online sipariş alabiliyor musunuz?", w: 20, tip: "Komisyonsuz sipariş kanalı, düzenli müşterilerin siparişini platformdan size taşır." },
  { id: "google", q: "Google işletme profiliniz güncel mi (saatler, menü linki, fotoğraflar)?", w: 10, tip: "Profildeki sipariş linkini kendi sitenize yönlendirin, çalışma saatlerini güncel tutun." },
  { id: "reviews", q: "Google'da 100'den fazla yorumunuz var mı?", w: 10, tip: "Siparişten sonra memnun müşterileri otomatik olarak Google yorumuna yönlendirin." },
  { id: "loyalty", q: "Müşterileriniz için puan ya da sadakat programınız var mı?", w: 10, tip: "Harcamanın bir kısmını puan olarak geri vermek tekrar siparişi belirgin şekilde artırır." },
  { id: "list", q: "Müşterilerinizin telefon numaraları ve ileti izinleri sizde kayıtlı mı?", w: 15, tip: "İYS uyumlu izinle topladığınız liste, platforma bağımlı kalmadan kampanya yapmanızı sağlar." },
  { id: "campaign", q: "Son 30 günde müşterilerinize SMS, e-posta veya WhatsApp kampanyası gönderdiniz mi?", w: 10, tip: "“Seni özledik” gibi otomatik kampanyalar uzun süredir gelmeyen müşteriyi geri getirir." },
  { id: "qr", q: "Masalarda veya paket poşetinde sitenize giden QR kod var mı?", w: 10, tip: "Paketin içine konan bir QR kart, bir sonraki siparişi doğrudan size getirir." },
];

export function Grader({ name }: { name: string }) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const done = QUESTIONS.every((q) => q.id in answers);
  const score = QUESTIONS.reduce((s, q) => s + (answers[q.id] ? q.w : 0), 0);
  const color = score >= 70 ? "#16a34a" : score >= 45 ? "#d97706" : "#dc2626";

  return (
    <div className="mt-8 space-y-4">
      <div className="space-y-2 rounded-[28px] bg-white p-4 shadow-xl ring-1 ring-ink/10 sm:p-6">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="flex flex-col gap-2 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-ink">{q.q}</p>
            <div className="flex flex-none gap-2">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: v }))}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition ${
                    answers[q.id] === v ? "bg-ink text-white ring-ink" : "bg-white text-ink ring-ink/20 hover:ring-ink/50"
                  }`}
                >
                  {v ? "Evet" : "Hayır"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-ink/10 sm:p-8">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 flex-none place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e7e5e4 0)` }}>
              <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white text-3xl font-extrabold">{score}</div>
            </div>
            <div>
              <p className="text-sm text-stone-500">{name || "Restoranınız"} için online görünürlük puanı</p>
              <p className="text-2xl font-extrabold text-ink">
                {score >= 70 ? "İyi durumdasınız" : score >= 45 ? "Geliştirilecek alanlar var" : "Büyük fırsat kaçıyor"}
              </p>
            </div>
          </div>
          {score < 100 && (
            <ul className="mt-6 space-y-3">
              {QUESTIONS.filter((q) => !answers[q.id]).map((q) => (
                <li key={q.id} className="flex gap-3 rounded-2xl bg-soft p-4 text-sm text-ink">
                  <span className="font-bold text-site">+{q.w}</span>
                  {q.tip}
                </li>
              ))}
            </ul>
          )}
          <Link href="/kayit" className="btn-site mt-6 w-full py-3.5 text-base">
            Eksikleri ücretsiz tamamla
          </Link>
          <p className="mt-2 text-center text-xs text-stone-500">Puan, verdiğiniz yanıtlara göre hesaplanır.</p>
        </div>
      )}
    </div>
  );
}
