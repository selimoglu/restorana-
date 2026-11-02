"use client";

import { useState, useTransition } from "react";
import { submitReview } from "./actions";

export function ReviewForm({ orderId, googleReviewUrl }: { orderId: string; googleReviewUrl: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (done) {
    return rating >= 4 && googleReviewUrl ? (
      <div className="text-sm">
        <p className="mb-3">Çok teşekkürler! Bu yorumu Google&apos;da da paylaşır mısınız? Küçük işletmelere çok büyük destek oluyor.</p>
        <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Google&apos;da yorum yap
        </a>
      </div>
    ) : (
      <p className="text-sm text-stone-600">Geri bildiriminiz restorana iletildi. Teşekkürler!</p>
    );
  }

  return (
    <div>
      <p className="mb-2 font-semibold">Siparişinizi nasıl buldunuz?</p>
      <div className="mb-3 flex gap-1 text-3xl" role="radiogroup" aria-label="Puan">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} yıldız`}
            onClick={() => setRating(n)}
            className={n <= rating ? "text-amber-500" : "text-stone-300"}
          >
            ★
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="input" placeholder="Yorumunuz (isteğe bağlı)" />
      <button
        disabled={!rating || pending}
        className="btn-primary mt-3"
        onClick={() =>
          start(async () => {
            await submitReview(orderId, rating, comment);
            setDone(true);
          })
        }
      >
        Gönder
      </button>
    </div>
  );
}
