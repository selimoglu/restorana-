"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { aiEnabled, extractJson, generateText } from "@/lib/ai";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { importMenu, parseMenuText } from "@/lib/menu-import";
import { slugify } from "@/lib/slug";

export type FormState = { error?: string };

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "E-posta veya şifre hatalı" };
  await createSession(user.id);
  redirect("/panel");
}

const signupSchema = z.object({
  ownerName: z.string().trim().min(2, "Adınızı girin"),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  restaurantName: z.string().trim().min(2, "Restoran adını girin"),
  cuisine: z.string().trim().default(""),
  city: z.string().trim().min(2, "İl seçin"),
  district: z.string().trim().default(""),
  phone: z.string().trim().default(""),
  menu: z.string().max(20000).default(""),
  terms: z.literal("on", { message: "Kullanım koşullarını onaylamalısınız" }),
});

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  if (await db.user.findUnique({ where: { email: d.email } })) return { error: "Bu e-posta ile zaten bir hesap var" };

  let slug = slugify(`${d.restaurantName} ${d.district}`) || "restoran";
  for (let i = 2; await db.restaurant.findUnique({ where: { slug } }); i++) slug = `${slugify(d.restaurantName)}-${i}`;

  // AI site metni: hata olursa kayıt yine de tamamlanır
  let copy = { tagline: "", about: "" };
  if (aiEnabled()) {
    try {
      copy = extractJson(
        await generateText(
          `Yeni açılan bir restoran web sitesi için JSON döndür: {"tagline":"en fazla 70 karakter slogan","about":"2-3 cümlelik, ilçe ve mutfak türünü doğal biçimde geçiren tanıtım"}. ` +
            `Restoran: ${d.restaurantName}, mutfak: ${d.cuisine || "belirtilmedi"}, konum: ${d.district} ${d.city}. Uydurma ödül, kuruluş yılı veya iddia ekleme.`,
        ),
      );
    } catch (e) {
      console.error("AI site metni üretilemedi", e);
    }
  }

  const restaurant = await db.restaurant.create({
    data: {
      slug,
      name: d.restaurantName,
      cuisine: d.cuisine,
      city: d.city,
      district: d.district,
      phone: d.phone,
      tagline: copy.tagline || `${d.district || d.city} ${d.cuisine ? "· " + d.cuisine : ""}`.trim(),
      about: copy.about,
      openingHours: JSON.stringify(Object.fromEntries(["pzt", "sal", "car", "per", "cum", "cmt", "paz"].map((k) => [k, "11:00-23:00"]))),
      users: { create: { email: d.email, name: d.ownerName, passwordHash: hashPassword(d.password) } },
      coupons: { create: { code: "HOSGELDIN", percentOff: 10 } },
    },
    include: { users: true },
  });

  if (d.menu.trim()) {
    try {
      await importMenu(restaurant.id, await parseMenuText(d.menu));
    } catch (e) {
      console.error("Menü içe aktarılamadı", e);
    }
  }

  await createSession(restaurant.users[0].id);
  redirect("/panel");
}
