import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Sağlık kontrolü: uygulama ve veritabanı bağlantısı çalışıyor mu?
export async function GET() {
  try {
    const restaurants = await db.restaurant.count();
    return Response.json({ ok: true, db: "ok", restaurants });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, db: "hata" }, { status: 503 });
  }
}
