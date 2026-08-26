import { prisma } from "@/db/prisma";
import { notificationService } from "@/services/notification.service";

export class BonusService {
  async settings() {
    return prisma.bonusSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });
  }

  async account(userId: string) {
    return prisma.bonusAccount.upsert({
      where: { userId },
      update: {},
      create: { userId, balance: 0 },
    });
  }

  async history(userId: string) {
    const account = await this.account(userId);
    return prisma.bonusTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async credit(userId: string, amount: number, type: string, description: string) {
    if (amount <= 0) return;
    const settings = await this.settings();
    const account = await this.account(userId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + settings.expiryDays);

    await prisma.$transaction([
      prisma.bonusAccount.update({
        where: { id: account.id },
        data: { balance: { increment: amount } },
      }),
      prisma.bonusTransaction.create({
        data: {
          accountId: account.id,
          amount,
          type,
          description,
          expiresAt,
        },
      }),
    ]);

    await notificationService.create(userId, "bonus_in", {
      amount: String(amount),
      description,
    });
  }

  async debit(userId: string, amount: number, type: string, description: string) {
    if (amount <= 0) return 0;
    const account = await this.account(userId);
    const used = Math.min(account.balance, amount);
    if (used <= 0) return 0;

    await prisma.$transaction([
      prisma.bonusAccount.update({
        where: { id: account.id },
        data: { balance: { decrement: used } },
      }),
      prisma.bonusTransaction.create({
        data: {
          accountId: account.id,
          amount: -used,
          type,
          description,
        },
      }),
    ]);

    await notificationService.create(userId, "bonus_out", {
      amount: String(used),
      description,
    });

    return used;
  }

  async maxPayable(orderSubtotal: number) {
    const settings = await this.settings();
    return Math.floor((orderSubtotal * settings.maxPayPercent) / 100);
  }

  async applyToOrder(userId: string, subtotal: number, requested: number) {
    const account = await this.account(userId);
    const cap = await this.maxPayable(subtotal);
    return Math.max(0, Math.min(requested, cap, account.balance, subtotal));
  }

  async onRegistration(userId: string) {
    const settings = await this.settings();
    await this.credit(userId, settings.registrationBonus, "registration", "Приветственный бонус");
  }

  async onPurchase(userId: string, total: number, title: string) {
    const settings = await this.settings();
    const amount = Math.round((total * settings.purchasePercent) / 100);
    await this.credit(userId, amount, "purchase", title);
  }

  async onSale(userId: string, title: string) {
    const settings = await this.settings();
    await this.credit(userId, settings.saleBonus, "sale", title);
  }

  async onTradeIn(userId: string, title: string) {
    const settings = await this.settings();
    await this.credit(userId, settings.tradeInBonus, "trade_in", title);
  }

  async onReview(userId: string) {
    const settings = await this.settings();
    await this.credit(userId, settings.reviewBonus, "review", "Отзыв о товаре");
  }

  async onReferral(userId: string) {
    const settings = await this.settings();
    await this.credit(userId, settings.referralBonus, "referral", "Приглашение друга");
  }
}

export const bonusService = new BonusService();
