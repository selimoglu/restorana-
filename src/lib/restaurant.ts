import { cache } from "react";
import { db } from "./db";

export const DAYS = [
  ["pzt", "Pazartesi"], ["sal", "Salı"], ["car", "Çarşamba"], ["per", "Perşembe"],
  ["cum", "Cuma"], ["cmt", "Cumartesi"], ["paz", "Pazar"],
] as const;

export const getRestaurant = cache(async (slug: string) =>
  db.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { sort: "asc" },
        include: { items: { orderBy: { sort: "asc" } } },
      },
    },
  }),
);

export type StoreRestaurant = NonNullable<Awaited<ReturnType<typeof getRestaurant>>>;

export function parseHours(json: string): Record<string, string> {
  try {
    return JSON.parse(json) as Record<string, string>;
  } catch {
    return {};
  }
}

/** İstanbul saatine göre şu an açık mı? Gece yarısını geçen saatleri de destekler. */
export function isOpenNow(hoursJson: string, now = new Date()): boolean {
  const hours = parseHours(hoursJson);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const idx = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(wd);
  const minutes = Number(parts.find((p) => p.type === "hour")?.value) * 60 + Number(parts.find((p) => p.type === "minute")?.value);
  const check = (dayIdx: number, offset: number) => {
    const range = hours[DAYS[(dayIdx + 7) % 7][0]];
    const m = range?.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
    if (!m) return false;
    const open = +m[1] * 60 + +m[2];
    let close = +m[3] * 60 + +m[4];
    if (close <= open) close += 24 * 60;
    const t = minutes + offset;
    return t >= open && t < close;
  };
  return check(idx, 0) || check(idx - 1, 24 * 60);
}
