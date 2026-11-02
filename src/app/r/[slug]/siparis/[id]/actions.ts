"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function submitReview(orderId: string, rating: number, comment: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { customer: true, restaurant: true } });
  if (!order || order.status !== "COMPLETED") return { ok: false };
  const exists = await db.review.findFirst({ where: { orderId } });
  if (exists) return { ok: true };
  const r = Math.max(1, Math.min(5, Math.round(rating)));
  const [first, last] = order.customer.name.split(/\s+/);
  await db.review.create({
    data: {
      restaurantId: order.restaurantId,
      orderId,
      rating: r,
      comment: comment.slice(0, 1000),
      customerName: `${first}${last ? " " + last[0] + "." : ""}`,
      // Düşük puanlar restorana özel geri bildirim olarak kalır, sitede gösterilmez.
      isPublic: r >= 4,
    },
  });
  revalidatePath(`/r/${order.restaurant.slug}`);
  return { ok: true };
}
