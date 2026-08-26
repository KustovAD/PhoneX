import { prisma } from "@/db/prisma";
import { bonusService } from "@/services/bonus.service";

export class ReviewService {
  async create(userId: string, productId: string, rating: number, text: string) {
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: { in: ["completed", "shipped", "processing", "confirmed"] } },
      },
    });
    if (!purchased) {
      throw new Error("NOT_PURCHASED");
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("NOT_FOUND");

    const review = await prisma.review.create({
      data: {
        authorId: userId,
        productId,
        sellerId: product.sellerId,
        orderId: purchased.orderId,
        rating,
        text,
      },
    });

    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count.rating,
      },
    });

    if (product.sellerId) {
      const sellerAgg = await prisma.review.aggregate({
        where: { sellerId: product.sellerId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await prisma.userProfile.update({
        where: { userId: product.sellerId },
        data: {
          ratingAvg: sellerAgg._avg.rating ?? 0,
          ratingCount: sellerAgg._count.rating,
        },
      });
    }

    await bonusService.onReview(userId);
    return review;
  }
}

export const reviewService = new ReviewService();
