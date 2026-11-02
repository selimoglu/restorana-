"use client";

import { useState, useTransition } from "react";
import { aiWebsiteCopy } from "../actions";

export function WebsiteCopyFields({ tagline, about }: { tagline: string; about: string }) {
  const [t, setT] = useState(tagline);
  const [a, setA] = useState(about);
  const [pending, start] = useTransition();
  return (
    <>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="label mb-0" htmlFor="tagline">Slogan</label>
          <button
            type="button"
            disabled={pending}
            className="text-sm font-semibold text-brand"
            onClick={() =>
              start(async () => {
                const res = await aiWebsiteCopy();
                setT(res.tagline);
                setA(res.about);
              })
            }
          >
            {pending ? "Yazılıyor…" : "✨ Site metinlerini AI ile yaz (SEO uyumlu)"}
          </button>
        </div>
        <input id="tagline" name="tagline" value={t} onChange={(e) => setT(e.target.value)} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="about">Hakkımızda</label>
        <textarea id="about" name="about" value={a} onChange={(e) => setA(e.target.value)} rows={4} className="input" />
      </div>
    </>
  );
}
