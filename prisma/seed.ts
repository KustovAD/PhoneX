import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASS = "PhoneX123!";
const inspection = JSON.stringify({
  screen: "pass",
  cameras: "pass",
  biometrics: "pass",
  speakers: "pass",
  mic: "pass",
  charging: "pass",
  wifi: "pass",
  bluetooth: "pass",
  buttons: "pass",
  battery: "pass",
  body: "pass",
});

async function main() {
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bonusTransaction.deleteMany();
  await prisma.bonusAccount.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.userListing.deleteMany();
  await prisma.tradeInValuation.deleteMany();
  await prisma.tradeInCondition.deleteMany();
  await prisma.tradeInRequest.deleteMany();
  await prisma.phoneModel.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tradeInCoefficient.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.bonusSettings.deleteMany();

  const [userRole, modRole, adminRole] = await Promise.all([
    prisma.role.create({ data: { name: "user", description: "Buyer / seller" } }),
    prisma.role.create({ data: { name: "moderator", description: "Listing moderator" } }),
    prisma.role.create({ data: { name: "admin", description: "Full access" } }),
  ]);

  const hash = await bcrypt.hash(PASS, 12);

  const mkUser = (
    email: string,
    first: string,
    last: string,
    roleId: string,
    phone: string,
    extras?: { verified?: boolean; bonuses?: number },
  ) =>
    prisma.user.create({
      data: {
        email,
        phone,
        passwordHash: hash,
        firstName: first,
        lastName: last,
        roleId,
        emailVerified: extras?.verified === false ? null : new Date(),
        referralCode: email.split("@")[0].slice(0, 8).toUpperCase(),
        profile: { create: { city: "Москва", dealsCount: 12, ratingAvg: 4.9, ratingCount: 18 } },
        bonusAccount: { create: { balance: extras?.bonuses ?? 0 } },
      },
    });

  const buyer = await mkUser("user@phonex.ru", "Анна", "Соколова", userRole.id, "+79991112233", { bonuses: 2450 });
  const seller = await mkUser("seller@phonex.ru", "Илья", "Морозов", userRole.id, "+79992223344", { bonuses: 800 });
  const moderator = await mkUser("moderator@phonex.ru", "Мария", "Ким", modRole.id, "+79993334455");
  const admin = await mkUser("admin@phonex.ru", "Егор", "Радин", adminRole.id, "+79994445566");

  await prisma.bonusSettings.create({ data: { id: "default" } });

  const phones = await prisma.category.create({
    data: { slug: "smartphones", nameRu: "Смартфоны", nameEn: "Smartphones", sortOrder: 1 },
  });
  await prisma.category.create({
    data: { slug: "accessories", nameRu: "Аксессуары", nameEn: "Accessories", sortOrder: 2 },
  });

  const brandData = [
    { slug: "apple", name: "Apple", demandScore: 1.08, sortOrder: 1 },
    { slug: "samsung", name: "Samsung", demandScore: 1.04, sortOrder: 2 },
    { slug: "xiaomi", name: "Xiaomi", demandScore: 0.98, sortOrder: 3 },
    { slug: "google", name: "Google", demandScore: 1.02, sortOrder: 4 },
    { slug: "oneplus", name: "OnePlus", demandScore: 0.96, sortOrder: 5 },
    { slug: "honor", name: "Honor", demandScore: 0.94, sortOrder: 6 },
    { slug: "huawei", name: "Huawei", demandScore: 0.9, sortOrder: 7 },
    { slug: "nothing", name: "Nothing", demandScore: 0.95, sortOrder: 8 },
  ];
  const brands = [];
  for (const b of brandData) {
    brands.push(await prisma.brand.create({ data: b }));
  }
  const bySlug = Object.fromEntries(brands.map((b) => [b.slug, b]));

  const models = [
    { brand: "apple", name: "iPhone 15", slug: "iphone-15", year: 2023, basePrice: 72000, demandScore: 1.05 },
    { brand: "apple", name: "iPhone 15 Pro", slug: "iphone-15-pro", year: 2023, basePrice: 98000, demandScore: 1.1 },
    { brand: "apple", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", year: 2023, basePrice: 118000, demandScore: 1.12 },
    { brand: "apple", name: "iPhone 14", slug: "iphone-14", year: 2022, basePrice: 54000, demandScore: 0.95 },
    { brand: "apple", name: "iPhone 13", slug: "iphone-13", year: 2021, basePrice: 42000, demandScore: 0.9 },
    { brand: "samsung", name: "Galaxy S24 Ultra", slug: "s24-ultra", year: 2024, basePrice: 92000, demandScore: 1.08 },
    { brand: "samsung", name: "Galaxy S24", slug: "s24", year: 2024, basePrice: 68000, demandScore: 1.02 },
    { brand: "samsung", name: "Galaxy Z Flip 6", slug: "z-flip-6", year: 2024, basePrice: 78000, demandScore: 0.97 },
    { brand: "xiaomi", name: "14 Ultra", slug: "14-ultra", year: 2024, basePrice: 76000, demandScore: 1.01 },
    { brand: "xiaomi", name: "14", slug: "xiaomi-14", year: 2024, basePrice: 52000, demandScore: 0.99 },
    { brand: "google", name: "Pixel 9 Pro", slug: "pixel-9-pro", year: 2024, basePrice: 89000, demandScore: 1.06 },
    { brand: "google", name: "Pixel 8", slug: "pixel-8", year: 2023, basePrice: 48000, demandScore: 0.98 },
    { brand: "oneplus", name: "12", slug: "oneplus-12", year: 2024, basePrice: 56000, demandScore: 0.97 },
    { brand: "honor", name: "Magic 6 Pro", slug: "magic-6-pro", year: 2024, basePrice: 62000, demandScore: 0.95 },
    { brand: "nothing", name: "Phone (2)", slug: "phone-2", year: 2023, basePrice: 42000, demandScore: 0.93 },
  ];
  for (const m of models) {
    const { brand, ...rest } = m;
    await prisma.phoneModel.create({
      data: { ...rest, brandId: bySlug[brand].id },
    });
  }

  const products = [
    { brand: "apple", model: "iPhone 15", storage: 128, colorRu: "Чёрный", colorEn: "Black", hex: "#1C1C1E", condition: "new", bat: 100, price: 74990, old: 79990, featured: true, sku: "PX-A15-128" },
    { brand: "apple", model: "iPhone 15", storage: 256, colorRu: "Голубой", colorEn: "Blue", hex: "#A8C5D4", condition: "like_new", bat: 97, price: 81990, featured: true, sku: "PX-A15-256" },
    { brand: "apple", model: "iPhone 15 Pro", storage: 256, colorRu: "Натуральный титан", colorEn: "Natural Titanium", hex: "#C4B7A6", condition: "excellent", bat: 94, price: 104990, old: 112990, featured: true, sku: "PX-A15P-256" },
    { brand: "apple", model: "iPhone 15 Pro Max", storage: 512, colorRu: "Чёрный титан", colorEn: "Black Titanium", hex: "#2C2C2E", condition: "new", bat: 100, price: 139990, featured: true, sku: "PX-A15PM-512" },
    { brand: "apple", model: "iPhone 14", storage: 128, colorRu: "Полуночный", colorEn: "Midnight", hex: "#191D26", condition: "good", bat: 88, price: 49990, old: 55990, sku: "PX-A14-128" },
    { brand: "apple", model: "iPhone 13", storage: 128, colorRu: "Сияющая звезда", colorEn: "Starlight", hex: "#F5F0E8", condition: "excellent", bat: 91, price: 39990, sku: "PX-A13-128" },
    { brand: "samsung", model: "Galaxy S24 Ultra", storage: 256, colorRu: "Титан чёрный", colorEn: "Titanium Black", hex: "#2B2B2B", condition: "new", bat: 100, price: 99990, featured: true, sku: "PX-S24U-256" },
    { brand: "samsung", model: "Galaxy S24 Ultra", storage: 512, colorRu: "Титан серый", colorEn: "Titanium Gray", hex: "#6E6E73", condition: "like_new", bat: 96, price: 109990, sku: "PX-S24U-512" },
    { brand: "samsung", model: "Galaxy S24", storage: 128, colorRu: "Onyx Black", colorEn: "Onyx Black", hex: "#111111", condition: "excellent", bat: 93, price: 62990, sku: "PX-S24-128" },
    { brand: "samsung", model: "Galaxy Z Flip 6", storage: 256, colorRu: "Mint", colorEn: "Mint", hex: "#B7C9B1", condition: "like_new", bat: 95, price: 74990, featured: true, sku: "PX-ZF6-256" },
    { brand: "xiaomi", model: "14 Ultra", storage: 512, colorRu: "Чёрный", colorEn: "Black", hex: "#0E0E10", condition: "new", bat: 100, price: 79990, featured: true, sku: "PX-MI14U-512" },
    { brand: "xiaomi", model: "14", storage: 256, colorRu: "Белый", colorEn: "White", hex: "#F2EFEA", condition: "excellent", bat: 92, price: 49990, sku: "PX-MI14-256" },
    { brand: "xiaomi", model: "Redmi Note 13 Pro", storage: 256, colorRu: "Зелёный", colorEn: "Green", hex: "#2F4F3E", condition: "good", bat: 89, price: 27990, sku: "PX-RN13P-256" },
    { brand: "google", model: "Pixel 9 Pro", storage: 256, colorRu: "Obsidian", colorEn: "Obsidian", hex: "#1A1C1E", condition: "new", bat: 100, price: 94990, featured: true, sku: "PX-P9P-256" },
    { brand: "google", model: "Pixel 8", storage: 128, colorRu: "Hazel", colorEn: "Hazel", hex: "#8A8474", condition: "like_new", bat: 94, price: 45990, sku: "PX-P8-128" },
    { brand: "google", model: "Pixel 8 Pro", storage: 256, colorRu: "Porcelain", colorEn: "Porcelain", hex: "#E6DED3", condition: "excellent", bat: 91, price: 67990, sku: "PX-P8P-256" },
    { brand: "oneplus", model: "12", storage: 256, colorRu: "Silky Black", colorEn: "Silky Black", hex: "#161616", condition: "new", bat: 100, price: 58990, sku: "PX-OP12-256" },
    { brand: "oneplus", model: "12R", storage: 256, colorRu: "Iron Gray", colorEn: "Iron Gray", hex: "#4A4E52", condition: "good", bat: 87, price: 39990, sku: "PX-OP12R-256" },
    { brand: "honor", model: "Magic 6 Pro", storage: 512, colorRu: "Black", colorEn: "Black", hex: "#101214", condition: "like_new", bat: 96, price: 64990, sku: "PX-HM6P-512" },
    { brand: "nothing", model: "Phone (2)", storage: 256, colorRu: "White", colorEn: "White", hex: "#EFECE6", condition: "excellent", bat: 93, price: 39990, sku: "PX-N2-256" },
  ];

  const createdProducts = [];
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        slug: `${p.sku.toLowerCase()}`,
        sku: p.sku,
        brandId: bySlug[p.brand].id,
        categoryId: phones.id,
        nameRu: `${bySlug[p.brand].name} ${p.model} ${p.storage} GB`,
        nameEn: `${bySlug[p.brand].name} ${p.model} ${p.storage} GB`,
        model: p.model,
        storageGb: p.storage,
        colorRu: p.colorRu,
        colorEn: p.colorEn,
        colorHex: p.hex,
        condition: p.condition,
        batteryHealth: p.bat,
        imei: `35${Math.floor(1000000000000 + Math.random() * 8999999999999)}`.slice(0, 15),
        region: "RU",
        warrantyMonths: p.condition === "new" ? 12 : 6,
        kitJson: JSON.stringify(["коробка", "кабель", "документы"]),
        price: p.price,
        oldPrice: p.old ?? null,
        stock: p.condition === "new" ? 6 : 2,
        isPublished: true,
        isFeatured: Boolean(p.featured),
        ratingAvg: 4.6 + Math.random() * 0.4,
        ratingCount: 8 + Math.floor(Math.random() * 40),
        viewCount: 40 + Math.floor(Math.random() * 400),
        descriptionRu: "Проверенный смартфон с диагностикой экрана, камер и аккумулятора.",
        descriptionEn: "Verified smartphone with display, camera, and battery diagnostics.",
        inspectionJson: inspection,
        images: {
          create: [
            { url: `/phones/${p.sku}.svg`, sortOrder: 0 },
            { url: `/phones/${p.sku}-2.svg`, sortOrder: 1 },
          ],
        },
      },
    });
    createdProducts.push(created);
  }

  const coeffs: Array<{ key: string; groupName: string; labelRu: string; labelEn: string; multiplier?: number; deduction?: number }> = [
    { key: "storage_64", groupName: "storage", labelRu: "64 GB", labelEn: "64 GB", multiplier: 0.9 },
    { key: "storage_128", groupName: "storage", labelRu: "128 GB", labelEn: "128 GB", multiplier: 1 },
    { key: "storage_256", groupName: "storage", labelRu: "256 GB", labelEn: "256 GB", multiplier: 1.08 },
    { key: "storage_512", groupName: "storage", labelRu: "512 GB", labelEn: "512 GB", multiplier: 1.16 },
    { key: "storage_1024", groupName: "storage", labelRu: "1 TB", labelEn: "1 TB", multiplier: 1.24 },
    { key: "battery_95_100", groupName: "battery", labelRu: "Аккумулятор 95–100%", labelEn: "Battery 95–100%", multiplier: 1 },
    { key: "battery_90_94", groupName: "battery", labelRu: "Аккумулятор 90–94%", labelEn: "Battery 90–94%", multiplier: 0.97, deduction: -2000 },
    { key: "battery_85_89", groupName: "battery", labelRu: "Аккумулятор 85–89%", labelEn: "Battery 85–89%", multiplier: 0.93, deduction: -4000 },
    { key: "battery_below_85", groupName: "battery", labelRu: "Аккумулятор ниже 85%", labelEn: "Battery below 85%", multiplier: 0.86, deduction: -7000 },
    { key: "screen_clean", groupName: "screen", labelRu: "Экран без повреждений", labelEn: "Clean display", deduction: 0 },
    { key: "screen_light_scratches", groupName: "screen", labelRu: "Мелкие царапины на экране", labelEn: "Light screen scratches", deduction: -1500 },
    { key: "screen_deep_scratches", groupName: "screen", labelRu: "Глубокие царапины на экране", labelEn: "Deep screen scratches", deduction: -4000 },
    { key: "screen_chips", groupName: "screen", labelRu: "Сколы экрана", labelEn: "Screen chips", deduction: -6000 },
    { key: "screen_cracks", groupName: "screen", labelRu: "Трещины экрана", labelEn: "Screen cracks", deduction: -12000 },
    { key: "screen_replaced", groupName: "screen", labelRu: "Экран менялся", labelEn: "Replaced display", deduction: -5000 },
    { key: "body_perfect", groupName: "body", labelRu: "Идеальный корпус", labelEn: "Perfect body", deduction: 0 },
    { key: "body_light_wear", groupName: "body", labelRu: "Небольшие следы использования", labelEn: "Light wear", deduction: -1500 },
    { key: "body_visible_scratches", groupName: "body", labelRu: "Заметные царапины корпуса", labelEn: "Visible body scratches", deduction: -3000 },
    { key: "body_chips", groupName: "body", labelRu: "Сколы корпуса", labelEn: "Body chips", deduction: -4500 },
    { key: "body_dents", groupName: "body", labelRu: "Вмятины", labelEn: "Dents", deduction: -6000 },
    { key: "body_cracks", groupName: "body", labelRu: "Трещины корпуса", labelEn: "Body cracks", deduction: -9000 },
    { key: "cameras_perfect", groupName: "cameras", labelRu: "Камеры идеально", labelEn: "Cameras perfect", deduction: 0 },
    { key: "cameras_issues", groupName: "cameras", labelRu: "Проблемы с камерами", labelEn: "Camera issues", deduction: -8000 },
    { key: "cameras_glass_damage", groupName: "cameras", labelRu: "Повреждено стекло камеры", labelEn: "Camera glass damage", deduction: -3500 },
    { key: "biometrics_works", groupName: "biometrics", labelRu: "Face ID / Touch ID работает", labelEn: "Biometrics work", deduction: 0 },
    { key: "biometrics_partial", groupName: "biometrics", labelRu: "Биометрия частично", labelEn: "Biometrics partial", deduction: -7000 },
    { key: "biometrics_broken", groupName: "biometrics", labelRu: "Биометрия не работает", labelEn: "Biometrics broken", deduction: -15000 },
    { key: "speakers_works", groupName: "speakers", labelRu: "Динамики в норме", labelEn: "Speakers OK", deduction: 0 },
    { key: "speakers_issues", groupName: "speakers", labelRu: "Проблемы динамиков/микрофона", labelEn: "Speaker issues", deduction: -4000 },
    { key: "charging_perfect", groupName: "charging", labelRu: "Зарядка идеально", labelEn: "Charging perfect", deduction: 0 },
    { key: "charging_unstable", groupName: "charging", labelRu: "Зарядка нестабильна", labelEn: "Charging unstable", deduction: -3500 },
    { key: "charging_broken", groupName: "charging", labelRu: "Зарядка не работает", labelEn: "Charging broken", deduction: -9000 },
    { key: "repair_none", groupName: "repair", labelRu: "Без ремонта", labelEn: "No repairs", deduction: 0 },
    { key: "repair_screen", groupName: "repair", labelRu: "Ремонт экрана", labelEn: "Screen repair", deduction: -4000 },
    { key: "repair_battery", groupName: "repair", labelRu: "Ремонт аккумулятора", labelEn: "Battery repair", deduction: -2500 },
    { key: "repair_body", groupName: "repair", labelRu: "Ремонт корпуса", labelEn: "Body repair", deduction: -3000 },
    { key: "repair_other", groupName: "repair", labelRu: "Другой ремонт", labelEn: "Other repair", deduction: -3500 },
    { key: "missing_box", groupName: "kit", labelRu: "Без коробки", labelEn: "No box", deduction: -800 },
    { key: "missing_cable", groupName: "kit", labelRu: "Без кабеля", labelEn: "No cable", deduction: -400 },
    { key: "missing_charger", groupName: "kit", labelRu: "Без оригинальной зарядки", labelEn: "No charger", deduction: -500 },
    { key: "missing_documents", groupName: "kit", labelRu: "Без документов", labelEn: "No documents", deduction: -300 },
  ];
  await prisma.tradeInCoefficient.createMany({ data: coeffs });

  const listing = await prisma.userListing.create({
    data: {
      userId: seller.id,
      brandId: bySlug.apple.id,
      model: "iPhone 14",
      storageGb: 128,
      color: "Midnight",
      imei: "353456789012345",
      condition: "excellent",
      batteryHealth: 91,
      kitJson: JSON.stringify(["box", "cable"]),
      price: 47000,
      recommendedPrice: 48500,
      status: "pending_moderation",
      images: { create: [{ url: "/phones/listing-1.svg", kind: "front", sortOrder: 0 }] },
    },
  });

  const trade = await prisma.tradeInRequest.create({
    data: {
      userId: buyer.id,
      status: "submitted",
      contactName: "Анна Соколова",
      contactPhone: "+79991112233",
      contactEmail: "user@phonex.ru",
      brandSlug: "apple",
      modelSlug: "iphone-15",
      modelName: "iPhone 15",
      storageGb: 128,
      year: 2023,
      conditions: {
        create: {
          batteryHealth: 95,
          screen: "light_scratches",
          body: "light_wear",
          cameras: "perfect",
          biometrics: "works",
          speakers: "works",
          charging: "perfect",
          repairsJson: JSON.stringify(["none"]),
          kitJson: JSON.stringify(["box", "cable"]),
        },
      },
      valuation: {
        create: {
          basePrice: 72000,
          estimated: 64000,
          estimatedMin: 60000,
          estimatedMax: 68000,
          breakdownJson: JSON.stringify([
            { key: "base", labelRu: "Базовая стоимость", labelEn: "Base value", amount: 72000 },
            { key: "screen", labelRu: "Царапины на экране", labelEn: "Screen scratches", amount: -1500 },
            { key: "body", labelRu: "Следы на корпусе", labelEn: "Body wear", amount: -1500 },
            { key: "missing_charger", labelRu: "Без зарядки", labelEn: "No charger", amount: -500 },
          ]),
        },
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      number: "PX-SEED001",
      userId: buyer.id,
      status: "completed",
      subtotal: createdProducts[0].price,
      bonusUsed: 800,
      bonusDiscount: 800,
      total: createdProducts[0].price - 800,
      contactName: "Анна Соколова",
      contactPhone: "+79991112233",
      contactEmail: "user@phonex.ru",
      address: "Москва, Пресненская наб. 12",
      items: {
        create: {
          productId: createdProducts[0].id,
          title: createdProducts[0].nameRu,
          price: createdProducts[0].price,
          quantity: 1,
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      authorId: buyer.id,
      productId: createdProducts[0].id,
      rating: 5,
      text: "Телефон как новый, доставка на следующий день. Оценка батареи совпала с заявленной.",
      orderId: order.id,
    },
  });

  await prisma.bonusTransaction.createMany({
    data: [
      { accountId: (await prisma.bonusAccount.findUnique({ where: { userId: buyer.id } }))!.id, amount: 500, type: "registration", description: "Welcome bonus" },
      { accountId: (await prisma.bonusAccount.findUnique({ where: { userId: buyer.id } }))!.id, amount: 2240, type: "purchase", description: "Покупка iPhone 15" },
      { accountId: (await prisma.bonusAccount.findUnique({ where: { userId: buyer.id } }))!.id, amount: 300, type: "trade_in", description: "Trade-in" },
      { accountId: (await prisma.bonusAccount.findUnique({ where: { userId: buyer.id } }))!.id, amount: -800, type: "order", description: "Использование бонусов" },
    ],
  });

  await prisma.notification.create({
    data: {
      userId: seller.id,
      type: "listing_approved",
      titleRu: "Объявление на модерации",
      titleEn: "Listing pending",
      bodyRu: "iPhone 14 ожидает проверки модератора.",
      bodyEn: "iPhone 14 is waiting for moderator review.",
      href: "/account/listings",
    },
  });

  console.log("Seed complete");
  console.log("Users: user@phonex.ru / seller@phonex.ru / moderator@phonex.ru / admin@phonex.ru");
  console.log("Password:", PASS);
  console.log("Listing", listing.id, "Trade-in", trade.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
