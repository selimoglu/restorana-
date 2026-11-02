import { db } from "@/lib/db";
import { seedDemo } from "@/lib/demo-seed";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  return req.headers.get("authorization") === `Bearer ${secret}` || url.searchParams.get("anahtar") === secret;
}

// Canlı ortamda demo restoranı oluşturmak/sıfırlamak için.
// Authorization: Bearer <CRON_SECRET>  (ya da tarayıcıdan ?anahtar=<CRON_SECRET>)
async function handle(req: Request) {
  if (!authorized(req)) return new Response("Yetkisiz", { status: 401 });
  await seedDemo(db);
  return Response.json({ ok: true, site: "/r/lezzet-duragi", giris: "demo@sofra.app" });
}

export { handle as GET, handle as POST };
