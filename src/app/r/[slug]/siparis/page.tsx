import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { getRestaurant } from "@/lib/restaurant";

export const metadata: Metadata = { title: "Siparişi tamamla", robots: { index: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Siparişi tamamla</h1>
      <CheckoutForm
        slug={slug}
        settings={{
          pickup: r.pickupEnabled,
          delivery: r.deliveryEnabled,
          deliveryFee: r.deliveryFee,
          freeDeliveryMin: r.freeDeliveryMin,
          minOrder: r.minOrder,
          cash: r.cashOnDelivery,
          cardOnDelivery: r.cardOnDelivery,
          online: r.onlinePayment,
          loyaltyPercent: r.loyaltyPercent,
          isOpen: r.isOpen,
        }}
      />
    </div>
  );
}
