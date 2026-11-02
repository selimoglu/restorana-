import { db } from "@/lib/db";
import { seedDemo } from "@/lib/demo-seed";

export const maxDuration = 60;

// Canlı ortamda demo restoranı oluşturmak/sıfırlamak için. Authorization: Bearer <CRON_SECRET>
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Yetkisiz", { status: 401 });
  }
  await seedDemo(db);
  return Response.json({ ok: true, site: "/r/lezzet-duragi", giris: "demo@sofra.app" });
}
