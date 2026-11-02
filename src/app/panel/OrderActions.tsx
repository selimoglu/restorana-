"use client";

import { useTransition } from "react";
import { advanceOrder, cancelOrder, markPaid } from "./actions";

const NEXT_LABEL: Record<string, string> = {
  ACCEPTED: "Onayla",
  PREPARING: "Hazırlamaya başla",
  READY: "Hazır",
  ON_THE_WAY: "Yola çıkar",
  COMPLETED: "Teslim edildi",
};

export function OrderActions({
  id,
  next,
  canCancel,
  unpaid,
  big,
}: {
  id: string;
  next: string | null;
  canCancel: boolean;
  unpaid?: boolean;
  big?: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-2">
      {next && (
        <button disabled={pending} onClick={() => start(() => advanceOrder(id))} className={`btn-primary ${big ? "px-6 py-3 text-base" : ""}`}>
          {NEXT_LABEL[next] ?? "İlerlet"}
        </button>
      )}
      {unpaid && (
        <button disabled={pending} onClick={() => start(() => markPaid(id))} className="btn-ghost">
          Ödendi işaretle
        </button>
      )}
      {canCancel && (
        <button
          disabled={pending}
          onClick={() => confirm("Sipariş iptal edilsin mi?") && start(() => cancelOrder(id))}
          className="btn-ghost text-red-700"
        >
          İptal
        </button>
      )}
    </div>
  );
}
