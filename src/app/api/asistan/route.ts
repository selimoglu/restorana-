import { z } from "zod";
import { aiEnabled } from "@/lib/ai";
import { askAssistant } from "@/lib/assistant";
import { getSessionUser } from "@/lib/auth";

const body = z.object({
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(8000) })).min(1).max(40),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Giriş gerekli" }, { status: 401 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  if (!aiEnabled()) {
    return Response.json({
      text: "AI asistanı kullanmak için sunucuda ANTHROPIC_API_KEY tanımlanmalı. Tanımlandığında satışlarınızı, menünüzü ve müşterilerinizi analiz edip kampanya taslakları hazırlayabilirim.",
    });
  }
  try {
    const text = await askAssistant(user.restaurantId, user.restaurant.name, parsed.data.history);
    return Response.json({ text });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Asistan şu an yanıt veremiyor, biraz sonra tekrar deneyin." }, { status: 502 });
  }
}
