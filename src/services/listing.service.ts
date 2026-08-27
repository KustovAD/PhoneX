import { prisma } from "@/db/prisma";
import { bonusService } from "@/services/bonus.service";
import { notificationService } from "@/services/notification.service";
import { slugify } from "@/lib/slugify";
import type { z } from "zod";
import type { listingSchema } from "@/lib/validations";

type ListingInput = z.infer<typeof listingSchema>;

export class ListingService {
  recommendPrice(basePrice: number, batteryHealth: number, condition: string) {
    const conditionMap: Record<string, number> = {
      new: 1,
      like_new: 0.92,
      excellent: 0.86,
      good: 0.78,
      used_traces: 0.68,
    };
    const battery = 0.7 + (batteryHealth / 100) * 0.3;
    return Math.round(basePrice * (conditionMap[condition] ?? 0.8) * battery);
  }

  async create(userId: string, input: ListingInput) {
    const brand = await prisma.brand.findUnique({ where: { id: input.brandId } });
    if (!brand) throw new Error("BRAND_NOT_FOUND");

    const model = await prisma.phoneModel.findFirst({
      where: { brandId: brand.id, name: { contains: input.model, mode: "insensitive" } },
    });
    const recommendedPrice = this.recommendPrice(
      model?.basePrice ?? input.price,
      input.batteryHealth,
      input.condition,
    );

    return prisma.userListing.create({
      data: {
        userId,
        brandId: input.brandId,
        model: input.model,
        version: input.version,
        storageGb: input.storageGb,
        color: input.color,
        imei: input.imei,
        region: input.region,
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
        condition: input.condition,
        batteryHealth: input.batteryHealth,
        chargeCycles: input.chargeCycles,
        defectsJson: JSON.stringify(input.defects),
        kitJson: JSON.stringify(input.kit),
        price: input.price,
        recommendedPrice,
        status: "pending_moderation",
        images: {
          create: input.images.map((url, index) => ({
            url,
            kind: index === 0 ? "front" : index === 1 ? "back" : "extra",
            sortOrder: index,
          })),
        },
      },
      include: { images: true, brand: true },
    });
  }

  async mine(userId: string) {
    return prisma.userListing.findMany({
      where: { userId },
      include: { images: true, brand: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async moderate(
    listingId: string,
    status: string,
    adminId: string,
    note?: string,
  ) {
    const listing = await prisma.userListing.findUnique({
      where: { id: listingId },
      include: { brand: true, images: true, user: true },
    });
    if (!listing) throw new Error("NOT_FOUND");
    if (listing.userId === adminId) {
      // ownership is for users; admin can moderate others
    }

    let productId: string | undefined;

    if (status === "published") {
      const category = await prisma.category.findFirst({ where: { slug: "smartphones" } });
      const product = await prisma.product.create({
        data: {
          slug: slugify(`${listing.brand.slug}-${listing.model}-${listing.id.slice(-6)}`),
          sku: `USR-${listing.id.slice(-8).toUpperCase()}`,
          brandId: listing.brandId,
          categoryId: category?.id ?? (await this.ensurePhoneCategory()),
          sellerId: listing.userId,
          listingId: listing.id,
          nameRu: `${listing.brand.name} ${listing.model} ${listing.storageGb} GB`,
          nameEn: `${listing.brand.name} ${listing.model} ${listing.storageGb} GB`,
          model: listing.model,
          version: listing.version,
          storageGb: listing.storageGb,
          colorRu: listing.color,
          colorEn: listing.color,
          condition: listing.condition,
          batteryHealth: listing.batteryHealth,
          chargeCycles: listing.chargeCycles,
          imei: listing.imei,
          region: listing.region,
          warrantyMonths: 3,
          kitJson: listing.kitJson,
          price: listing.price,
          stock: 1,
          isPublished: true,
          descriptionRu: "Объявление пользователя, проверено модератором PhoneX.",
          descriptionEn: "User listing verified by a PhoneX moderator.",
          images: {
            create: listing.images.map((image) => ({
              url: image.url,
              sortOrder: image.sortOrder,
            })),
          },
        },
      });
      productId = product.id;
      await bonusService.onSale(listing.userId, listing.model);
    }

    const updated = await prisma.userListing.update({
      where: { id: listingId },
      data: {
        status,
        moderatorNote: note,
        rejectReason: status === "rejected" ? note : null,
      },
    });

    await prisma.adminAction.create({
      data: {
        adminId,
        action: `listing.${status}`,
        entityType: "listing",
        entityId: listingId,
        payload: note,
      },
    });

    if (status === "published") {
      await notificationService.create(listing.userId, "listing_approved");
    } else if (status === "rejected") {
      await notificationService.create(listing.userId, "listing_rejected");
    } else if (status === "unpublished") {
      await notificationService.create(listing.userId, "listing_photos");
      if (productId) {
        await prisma.product.update({ where: { id: productId }, data: { isPublished: false } });
      }
    }

    return updated;
  }

  private async ensurePhoneCategory() {
    const existing = await prisma.category.findFirst({ where: { slug: "smartphones" } });
    if (existing) return existing.id;
    const created = await prisma.category.create({
      data: { slug: "smartphones", nameRu: "Смартфоны", nameEn: "Smartphones" },
    });
    return created.id;
  }
}

export const listingService = new ListingService();
