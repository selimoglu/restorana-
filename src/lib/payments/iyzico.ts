import { createHmac, randomBytes } from "crypto";

/**
 * iyzico Ödeme Formu (Checkout Form) entegrasyonu.
 * Anahtarlar tanımlı değilse `iyzicoEnabled()` false döner ve uygulama demo ödemeye düşer.
 */
export function iyzicoEnabled(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

function baseUrl() {
  return process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";
}

async function call<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.IYZICO_API_KEY!;
  const secretKey = process.env.IYZICO_SECRET_KEY!;
  const rnd = `${Date.now()}${randomBytes(4).toString("hex")}`;
  const json = JSON.stringify(body);
  const signature = createHmac("sha256", secretKey).update(rnd + path + json).digest("hex");
  const auth = Buffer.from(`apiKey:${apiKey}&randomKey:${rnd}&signature:${signature}`).toString("base64");
  const res = await fetch(baseUrl() + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `IYZWSv2 ${auth}`,
      "x-iyzi-rnd": rnd,
    },
    body: json,
  });
  return (await res.json()) as T;
}

const money = (kurus: number) => (kurus / 100).toFixed(2);

export interface CheckoutInput {
  orderId: string;
  total: number; // kuruş
  callbackUrl: string;
  buyer: { id: string; name: string; phone: string; email: string; address: string; city: string; ip: string };
  items: { id: string; name: string; price: number }[]; // price = satır toplamı (kuruş)
}

export async function initCheckoutForm(input: CheckoutInput) {
  const [first, ...rest] = input.buyer.name.trim().split(/\s+/);
  const address = {
    contactName: input.buyer.name,
    city: input.buyer.city,
    country: "Turkey",
    address: input.buyer.address || input.buyer.city,
  };
  const basketTotal = input.items.reduce((s, i) => s + i.price, 0);
  const body = {
    locale: "tr",
    conversationId: input.orderId,
    price: money(basketTotal),
    paidPrice: money(input.total),
    currency: "TRY",
    basketId: input.orderId,
    paymentGroup: "PRODUCT",
    callbackUrl: input.callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: input.buyer.id,
      name: first || "Müşteri",
      surname: rest.join(" ") || "-",
      gsmNumber: "+" + input.buyer.phone,
      email: input.buyer.email || "musteri@ornek.com",
      identityNumber: "11111111111", // iyzico zorunlu alan; gıda siparişinde TCKN istenmez
      registrationAddress: address.address,
      ip: input.buyer.ip,
      city: input.buyer.city,
      country: "Turkey",
    },
    shippingAddress: address,
    billingAddress: address,
    basketItems: input.items.map((i) => ({
      id: i.id,
      name: i.name,
      category1: "Yemek",
      itemType: "PHYSICAL",
      price: money(i.price),
    })),
  };
  return call<{ status: string; errorMessage?: string; token?: string; paymentPageUrl?: string }>(
    "/payment/iyzipay/checkoutform/initialize/auth/ecom",
    body,
  );
}

export async function retrieveCheckoutForm(token: string) {
  return call<{ status: string; paymentStatus?: string; basketId?: string; paymentId?: string; errorMessage?: string }>(
    "/payment/iyzipay/checkoutform/auth/ecom/detail",
    { locale: "tr", token },
  );
}
