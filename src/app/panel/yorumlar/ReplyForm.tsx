"use client";

import { useState, useTransition } from "react";
import { aiReplyReview, saveReply } from "../actions";

export function ReplyForm({ id, reply }: { id: string; reply: string }) {
  const [text, setText] = useState(reply);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(Boolean(reply));

  return (
    <form
      action={async (f) => {
        await saveReply(f);
        setSaved(true);
      }}
      className="mt-3 space-y-2"
    >
      <input type="hidden" name="id" value={id} />
      <textarea
        name="reply"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        rows={2}
        className="input"
        placeholder="Yanıtınız"
      />
      <div className="flex gap-2">
        <button type="button" disabled={pending} className="btn-ghost" onClick={() => start(async () => { setText(await aiReplyReview(id)); setSaved(false); })}>
          {pending ? "Yazılıyor…" : "✨ AI yanıt öner"}
        </button>
        <button disabled={saved || !text} className="btn-dark">
          {saved ? "Kaydedildi" : "Yanıtı kaydet"}
        </button>
      </div>
    </form>
  );
}
