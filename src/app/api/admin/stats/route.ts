import { jsonError, jsonOk } from "@/lib/api-response";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/db/prisma";

export async function GET() {
  try {
    await requireStaff();
  } catch {
    return jsonError("Forbidden", 403);
  }

  const [users, orders, products, listings, tradeIns] = await Promise.all([
    prisma.user.count(),
    prisma.order.findMany({ select: { total: true, createdAt: true, status: true } }),
    prisma.product.count(),
    prisma.userListing.groupBy({ by: ["status"], _count: true }),
    prisma.tradeInRequest.count(),
  ]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsers = await prisma.user.count({ where: { createdAt: { gte: weekAgo } } });
  const turnover = orders.reduce((sum, order) => sum + order.total, 0);

  return jsonOk({
    users,
    newUsers,
    orders: orders.length,
    sales: orders.filter((o) => o.status !== "cancelled").length,
    turnover,
    products,
    listings,
    pendingListings: listings.find((l) => l.status === "pending_moderation")?._count ?? 0,
    tradeIns,
  });
}
