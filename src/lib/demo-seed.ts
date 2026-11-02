import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./auth";

const MENU: Record<string, [string, string, number, { popular?: boolean; upsell?: boolean }?][]> = {
  "Başlangıçlar": [
    ["Mercimek Çorbası", "Tereyağlı, limon ve kıtır ekmekle", 9500, { upsell: true }],
    ["Humus", "Tahinli nohut ezmesi, sıcak pide ile", 11000],
    ["Sigara Böreği (6 adet)", "Beyaz peynirli, çıtır çıtır", 12500, { upsell: true }],
  ],
  "Ana Yemekler": [
    ["Adana Kebap", "Zırh kıyması acılı kebap, közlenmiş biber ve domatesle", 38500, { popular: true }],
    ["İskender", "Tereyağlı döner, yoğurt ve domates sosu", 42000, { popular: true }],
    ["Tavuk Şiş", "Özel marine tavuk, bulgur pilavı ile", 29500],
    ["Karışık Izgara", "Adana, kuzu şiş, tavuk kanat ve köfte (2 kişilik)", 89000],
    ["Lahmacun", "İnce hamur, bol yeşillik", 9000, { popular: true }],
  ],
  "Tatlılar": [
    ["Künefe", "Hatay peyniri, Antep fıstığı", 16500, { upsell: true }],
    ["Sütlaç", "Fırında, tarçınlı", 9500],
  ],
  "İçecekler": [
    ["Ayran", "Yayık ayranı, 300 ml", 4000, { upsell: true }],
    ["Şalgam", "Acılı / acısız", 4500],
    ["Kola", "330 ml", 5000],
  ],
};

/** Örnek restoran "Lezzet Durağı" ve demo hesabını (yeniden) oluşturur. */
export async function seedDemo(db: PrismaClient) {
  // Siparişler müşterilere bağlı olduğu için önce onlar silinir
  await db.order.deleteMany({ where: { restaurant: { slug: "lezzet-duragi" } } });
  await db.restaurant.deleteMany({ where: { slug: "lezzet-duragi" } });
  await db.user.deleteMany({ where: { email: "demo@sofra.app" } });

  const r = await db.restaurant.create({
    data: {
      slug: "lezzet-duragi",
      name: "Lezzet Durağı",
      tagline: "Kadıköy'ün odun ateşinde kebapçısı",
      about:
        "2009'dan beri Moda'da, odun ateşinde pişen kebaplar ve el açması lahmacunlarla hizmet veriyoruz. Siparişlerinizi doğrudan bizden verin, aracı komisyonu yerine size puan olarak dönsün.",
      cuisine: "Kebap & Izgara",
      phone: "02163450000",
      whatsapp: "905321234567",
      address: "Caferağa Mah. Moda Cad. No: 12",
      city: "İstanbul",
      district: "Kadıköy",
      instagram: "lezzetduragi",
      primaryColor: "#b91c1c",
      openingHours: JSON.stringify({
        pzt: "11:00-23:00", sal: "11:00-23:00", car: "11:00-23:00", per: "11:00-23:00",
        cum: "11:00-00:00", cmt: "11:00-00:00", paz: "12:00-22:00",
      }),
      deliveryFee: 3000,
      freeDeliveryMin: 50000,
      minOrder: 15000,
      plan: "buyume",
      users: { create: { email: "demo@sofra.app", name: "Demo İşletme", passwordHash: hashPassword("demo1234") } },
      coupons: { create: [{ code: "HOSGELDIN", percentOff: 15, minOrder: 30000 }, { code: "OZLEDIK", percentOff: 10 }] },
    },
  });

  let sort = 0;
  const items = [];
  for (const [cat, list] of Object.entries(MENU)) {
    const c = await db.category.create({ data: { name: cat, sort: sort++, restaurantId: r.id } });
    for (const [i, [name, description, price, f]] of list.entries()) {
      items.push(
        await db.menuItem.create({
          data: {
            name, description, price, sort: i, categoryId: c.id, restaurantId: r.id,
            isPopular: f?.popular ?? false, isUpsell: f?.upsell ?? false,
          },
        }),
      );
    }
  }

  const people = [
    ["Ayşe Yılmaz", "905321112233", true], ["Mehmet Kaya", "905332223344", true],
    ["Zeynep Demir", "905443334455", false], ["Can Öztürk", "905054445566", true],
    ["Elif Şahin", "905365556677", true], ["Burak Arslan", "905376667788", true],
  ] as const;
  const customers = [];
  for (const [name, phone, consent] of people) {
    customers.push(
      await db.customer.create({
        data: { name, phone, restaurantId: r.id, marketingConsent: consent, kvkkConsentAt: new Date() },
      }),
    );
  }

  // Son 21 güne yayılmış örnek siparişler
  let number = 1000;
  for (let d = 21; d >= 0; d--) {
    const count = 2 + ((d * 7) % 5);
    for (let k = 0; k < count; k++) {
      const cust = customers[(d + k) % customers.length];
      if (d < 16 && cust.name === "Burak Arslan") continue; // kaybedilme riski olan müşteri örneği
      const picks = [items[(d + k) % items.length], items[(d * 3 + k) % items.length]];
      const subtotal = picks.reduce((s, p) => s + p.price, 0);
      const delivery = k % 2 === 0;
      const createdAt = new Date(Date.now() - d * 86400000 - k * 3600000);
      const isToday = d === 0 && k < 2;
      const total = subtotal + (delivery ? 3000 : 0);
      await db.order.create({
        data: {
          restaurantId: r.id, customerId: cust.id, number: ++number,
          type: delivery ? "DELIVERY" : "PICKUP",
          status: isToday ? (k === 0 ? "NEW" : "PREPARING") : "COMPLETED",
          paymentMethod: k % 3 === 0 ? "CASH" : "ONLINE",
          paymentStatus: k % 3 === 0 && isToday ? "PENDING" : "PAID",
          subtotal, deliveryFee: delivery ? 3000 : 0, total,
          address: delivery ? "Osmanağa Mah. Söğütlü Çeşme Cad. No: 5 D: 3, Kadıköy" : "",
          createdAt, pointsEarned: isToday ? 0 : Math.floor(subtotal * 0.05),
          items: { create: picks.map((p) => ({ menuItemId: p.id, name: p.name, unitPrice: p.price, quantity: 1 })) },
        },
      });
      if (!isToday) {
        await db.customer.update({
          where: { id: cust.id },
          data: {
            orderCount: { increment: 1 }, totalSpent: { increment: total },
            points: { increment: Math.floor(subtotal * 0.05) }, lastOrderAt: createdAt,
          },
        });
      }
    }
  }

  await db.review.createMany({
    data: [
      { restaurantId: r.id, customerName: "Ayşe Y.", rating: 5, comment: "Adana harikaydı, sıcacık geldi. Puan sistemi de çok iyi!" },
      { restaurantId: r.id, customerName: "Mehmet K.", rating: 4, comment: "Lezzet çok iyi ama paket biraz geç geldi." },
      { restaurantId: r.id, customerName: "Can Ö.", rating: 2, comment: "İskender'in sosu azdı, ekmek ıslak değildi." },
    ],
  });

  await db.campaign.createMany({
    data: [
      {
        restaurantId: r.id, name: "Seni özledik (otomatik)", channel: "SMS", audience: "LAPSED", status: "ACTIVE",
        automation: "WIN_BACK",
        message: "Lezzet Durağı'ndan selam! Seni özledik. OZLEDIK koduyla bir sonraki siparişinde %10 indirim seni bekliyor.",
      },
      {
        restaurantId: r.id, name: "İlk sipariş teşekkürü (otomatik)", channel: "EMAIL", audience: "NEW", status: "ACTIVE",
        automation: "FIRST_ORDER_THANKS",
        message: "İlk siparişin için teşekkürler! Kazandığın puanları bir sonraki siparişinde kullanabilirsin.",
      },
    ],
  });

}
