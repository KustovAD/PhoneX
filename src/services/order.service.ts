import { nanoid } from "nanoid";
import { prisma } from "@/db/prisma";
import { bonusService } from "@/services/bonus.service";
import { notificationService } from "@/services/notification.service";
import type { z } from "zod";
import type { checkoutSchema } from "@/lib/validations";

type CheckoutInput = z.infer<typeof checkoutSchema>;

export class OrderService {
  async create(userId: string, input: CheckoutInput) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: input.items.map((item) => item.productId) },
        isPublished: true,
      },
    });

    if (products.length !== input.items.length) {
      throw new Error("PRODUCT_UNAVAILABLE");
    }

    let subtotal = 0;
    const lines = input.items.map((item) => {
      const product = products.find((row) => row.id === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new Error("OUT_OF_STOCK");
      }
      subtotal += product.price * item.quantity;
      return { product, quantity: item.quantity };
    });

    const bonusUsed = await bonusService.applyToOrder(userId, subtotal, input.bonusToUse);
    const total = Math.max(0, subtotal - bonusUsed);

    const order = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        await tx.product.update({
          where: { id: line.product.id },
          data: { stock: { decrement: line.quantity } },
        });
      }

      return tx.order.create({
        data: {
          number: `PX-${nanoid(8).toUpperCase()}`,
          userId,
          status: "pending",
          subtotal,
          bonusUsed,
          bonusDiscount: bonusUsed,
          total,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          address: input.address,
          comment: input.comment,
          items: {
            create: lines.map((line) => ({
              productId: line.product.id,
              title: line.product.nameRu,
              price: line.product.price,
              quantity: line.quantity,
            })),
          },
        },
        include: { items: true },
      });
    });

    if (bonusUsed > 0) {
      await bonusService.debit(userId, bonusUsed, "order", `Заказ ${order.number}`);
    }

    await bonusService.onPurchase(userId, total, `Purchase · ${order.number}`);
    await notificationService.create(userId, "order_status", {
      number: order.number,
      status: "pending",
    });

    const sellerIds = [...new Set(products.map((p) => p.sellerId).filter(Boolean))] as string[];
    await Promise.all(
      sellerIds.map((sellerId) =>
        notificationService.create(sellerId, "product_sold", {
          title: products.find((p) => p.sellerId === sellerId)?.nameRu ?? "Телефон",
        }),
      ),
    );

    return order;
  }

  async mine(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(orderId: string, status: string, adminId: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await prisma.adminAction.create({
      data: {
        adminId,
        action: "order.status",
        entityType: "order",
        entityId: orderId,
        payload: status,
      },
    });

    await notificationService.create(order.userId, "order_status", {
      number: order.number,
      status,
    });

    return order;
  }
}

export const orderService = new OrderService();
