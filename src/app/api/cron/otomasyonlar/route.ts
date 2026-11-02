import { runWinBackAutomations } from "@/lib/automations";

// Günde bir kez çağrılmalı (ör. Vercel Cron). Authorization: Bearer <CRON_SECRET>
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Yetkisiz", { status: 401 });
  }
  const sent = await runWinBackAutomations();
  return Response.json({ sent });
}
