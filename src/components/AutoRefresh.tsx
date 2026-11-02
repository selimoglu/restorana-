"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Sunucu bileşenini belirli aralıklarla yeniler (sipariş takibi, panel). */
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
