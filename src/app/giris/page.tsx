"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "../auth-actions";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={action} className="card w-full max-w-sm space-y-4">
        <Link href="/" className="text-xl font-extrabold">
          {BRAND.name}
        </Link>
        <h1 className="text-lg font-semibold">İşletme girişi</h1>
        <div>
          <label className="label" htmlFor="email">E-posta</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Şifre</label>
          <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
        </div>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="btn-dark w-full">
          {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
        <p className="text-center text-sm text-stone-500">
          Hesabınız yok mu? <Link href="/kayit" className="font-semibold text-stone-900 underline">Ücretsiz başlayın</Link>
        </p>
        <p className="rounded-lg bg-stone-100 p-2 text-center text-xs text-stone-500">Demo: demo@sofra.app / demo1234</p>
      </form>
    </div>
  );
}
