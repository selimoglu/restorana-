
-- CreateTable
CREATE TABLE "sofra"."Restaurant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "about" TEXT NOT NULL DEFAULT '',
    "cuisine" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT 'İstanbul',
    "district" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "googleReviewUrl" TEXT NOT NULL DEFAULT '',
    "heroImageUrl" TEXT NOT NULL DEFAULT '',
    "primaryColor" TEXT NOT NULL DEFAULT '#c2410c',
    "openingHours" TEXT NOT NULL DEFAULT '{}',
    "pickupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "freeDeliveryMin" INTEGER NOT NULL DEFAULT 0,
    "minOrder" INTEGER NOT NULL DEFAULT 0,
    "prepMinutes" INTEGER NOT NULL DEFAULT 20,
    "loyaltyPercent" INTEGER NOT NULL DEFAULT 5,
    "cashOnDelivery" BOOLEAN NOT NULL DEFAULT true,
    "cardOnDelivery" BOOLEAN NOT NULL DEFAULT true,
    "onlinePayment" BOOLEAN NOT NULL DEFAULT true,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "plan" TEXT NOT NULL DEFAULT 'baslangic',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isUpsell" BOOLEAN NOT NULL DEFAULT false,
    "allergens" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "points" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "lastOrderAt" TIMESTAMP(3),
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "kvkkConsentAt" TIMESTAMP(3),
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."Order" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentRef" TEXT NOT NULL DEFAULT '',
    "subtotal" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "scheduledFor" TIMESTAMP(3),
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "customerId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."OrderItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "automation" TEXT NOT NULL DEFAULT '',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."Review" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "reply" TEXT NOT NULL DEFAULT '',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "orderId" TEXT,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sofra"."Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percentOff" INTEGER NOT NULL DEFAULT 0,
    "amountOff" INTEGER NOT NULL DEFAULT 0,
    "minOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "sofra"."Restaurant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "sofra"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_restaurantId_phone_key" ON "sofra"."Customer"("restaurantId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Order_restaurantId_number_key" ON "sofra"."Order"("restaurantId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_restaurantId_code_key" ON "sofra"."Coupon"("restaurantId", "code");

-- AddForeignKey
ALTER TABLE "sofra"."User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "sofra"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."Category" ADD CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "sofra"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "sofra"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."MenuItem" ADD CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "sofra"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."Customer" ADD CONSTRAINT "Customer_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "sofra"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "sofra"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."Order" ADD CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "sofra"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sofra"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "sofra"."MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."Campaign" ADD CONSTRAINT "Campaign_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "sofra"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."Review" ADD CONSTRAINT "Review_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "sofra"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sofra"."Coupon" ADD CONSTRAINT "Coupon_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "sofra"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

