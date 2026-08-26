import { prisma } from "@/db/prisma";

type NotifyVars = Record<string, string>;

const TEMPLATES: Record<
  string,
  { titleRu: string; titleEn: string; bodyRu: string; bodyEn: string; href?: string }
> = {
  listing_approved: {
    titleRu: "Объявление одобрено",
    titleEn: "Listing approved",
    bodyRu: "Ваше объявление опубликовано и доступно покупателям.",
    bodyEn: "Your listing is live and visible to buyers.",
    href: "/account/listings",
  },
  listing_rejected: {
    titleRu: "Объявление отклонено",
    titleEn: "Listing rejected",
    bodyRu: "Модератор отклонил объявление. Проверьте комментарий в кабинете.",
    bodyEn: "A moderator rejected your listing. Check the note in your account.",
    href: "/account/listings",
  },
  listing_photos: {
    titleRu: "Нужны дополнительные фото",
    titleEn: "Additional photos requested",
    bodyRu: "Загрузите более чёткие снимки устройства.",
    bodyEn: "Please upload clearer photos of the device.",
    href: "/account/listings",
  },
  order_status: {
    titleRu: "Статус заказа изменён",
    titleEn: "Order status updated",
    bodyRu: "Заказ {number}: {status}",
    bodyEn: "Order {number}: {status}",
    href: "/account/orders",
  },
  tradein_valuation: {
    titleRu: "Новая оценка Trade-in",
    titleEn: "New Trade-in estimate",
    bodyRu: "Предварительная стоимость: {price} ₽",
    bodyEn: "Estimated value: {price} RUB",
    href: "/account",
  },
  bonus_in: {
    titleRu: "Начислены бонусы",
    titleEn: "Bonuses credited",
    bodyRu: "+{amount} · {description}",
    bodyEn: "+{amount} · {description}",
    href: "/account/bonuses",
  },
  bonus_out: {
    titleRu: "Бонусы списаны",
    titleEn: "Bonuses spent",
    bodyRu: "−{amount} · {description}",
    bodyEn: "−{amount} · {description}",
    href: "/account/bonuses",
  },
  product_sold: {
    titleRu: "Товар куплен",
    titleEn: "Item purchased",
    bodyRu: "Покупатель оформил заказ на «{title}».",
    bodyEn: "A buyer purchased “{title}”.",
    href: "/account/listings",
  },
};

function fill(template: string, vars: NotifyVars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

export class NotificationService {
  async create(userId: string, type: string, vars: NotifyVars = {}, href?: string) {
    const template = TEMPLATES[type];
    if (!template) return;

    return prisma.notification.create({
      data: {
        userId,
        type,
        titleRu: fill(template.titleRu, vars),
        titleEn: fill(template.titleEn, vars),
        bodyRu: fill(template.bodyRu, vars),
        bodyEn: fill(template.bodyEn, vars),
        href: href ?? template.href,
      },
    });
  }

  async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  async unreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async markRead(userId: string, id?: string) {
    if (id) {
      return prisma.notification.updateMany({
        where: { id, userId },
        data: { readAt: new Date() },
      });
    }
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();
