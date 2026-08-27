import { prisma } from "@/db/prisma";
import { BATTERY_BANDS } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

type ProductQuery = {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  storage?: string;
  condition?: string;
  battery?: string;
  color?: string;
  inStock?: string;
  sort?: string;
  q?: string;
  featured?: string;
  page?: number;
};

const PAGE_SIZE = 12;

export class ProductService {
  async list(query: ProductQuery) {
    const where: Prisma.ProductWhereInput = {
      isPublished: true,
    };

    if (query.brand) {
      const slugs = query.brand.split(",").filter(Boolean);
      where.brand = { slug: { in: slugs } };
    }
    if (query.minPrice || query.maxPrice) {
      where.price = {
        gte: query.minPrice || undefined,
        lte: query.maxPrice || undefined,
      };
    }
    if (query.storage) {
      where.storageGb = {
        in: query.storage.split(",").map((v) => Number(v)).filter(Boolean),
      };
    }
    if (query.condition) {
      where.condition = { in: query.condition.split(",") };
    }
    if (query.color) {
      where.OR = [
        { colorRu: { contains: query.color, mode: "insensitive" } },
        { colorEn: { contains: query.color, mode: "insensitive" } },
      ];
    }
    if (query.inStock === "1") {
      where.stock = { gt: 0 };
    }
    if (query.featured === "1") {
      where.isFeatured = true;
    }
    if (query.q) {
      where.OR = [
        { nameRu: { contains: query.q, mode: "insensitive" } },
        { nameEn: { contains: query.q, mode: "insensitive" } },
        { model: { contains: query.q, mode: "insensitive" } },
        { brand: { name: { contains: query.q, mode: "insensitive" } } },
      ];
    }
    if (query.battery) {
      const bands = query.battery.split(",");
      where.OR = bands
        .map((key) => BATTERY_BANDS.find((b) => b.key === key))
        .filter(Boolean)
        .map((band) => ({
          batteryHealth: { gte: band!.min, lte: band!.max },
        }));
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === "price_asc"
        ? { price: "asc" }
        : query.sort === "price_desc"
          ? { price: "desc" }
          : query.sort === "rating"
            ? { ratingAvg: "desc" }
            : query.sort === "popular"
              ? { viewCount: "desc" }
              : { createdAt: "desc" };

    const page = Math.max(1, query.page ?? 1);
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          seller: { include: { profile: true, role: true } },
        },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async bySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        seller: { include: { profile: true } },
        reviews: {
          include: { author: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
      },
    });
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      });
    }
    return product;
  }

  async searchSuggest(q: string) {
    if (!q.trim()) return [];
    return prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { nameRu: { contains: q, mode: "insensitive" } },
          { nameEn: { contains: q, mode: "insensitive" } },
          { model: { contains: q, mode: "insensitive" } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { brand: true },
      take: 8,
      orderBy: { viewCount: "desc" },
    });
  }
}

export const productService = new ProductService();
