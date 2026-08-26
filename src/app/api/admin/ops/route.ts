import { jsonError, jsonOk } from "@/lib/api-response";
import { requireAdmin, requireStaff } from "@/lib/session";
import { prisma } from "@/db/prisma";
import { orderService } from "@/services/order.service";

export async function GET() {
  try {
    await requireStaff();
    const [listings, tradeIns, settings, coefficients] = await Promise.all([
      prisma.userListing.findMany({
        include: { user: true, brand: true, images: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tradeInRequest.findMany({
        include: { user: true, valuation: true, conditions: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bonusSettings.findUnique({ where: { id: "default" } }),
      prisma.tradeInCoefficient.findMany({ orderBy: { groupName: "asc" } }),
    ]);
    return jsonOk({ listings, tradeIns, settings, coefficients });
  } catch {
    return jsonError("Forbidden", 403);
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    if (body.type === "bonus") {
      const settings = await prisma.bonusSettings.update({
        where: { id: "default" },
        data: body.data,
      });
      return jsonOk(settings);
    }
    if (body.type === "coefficient") {
      const coeff = await prisma.tradeInCoefficient.update({
        where: { id: body.id },
        data: { multiplier: body.multiplier, deduction: body.deduction },
      });
      return jsonOk(coeff);
    }
    if (body.type === "tradein") {
      const updated = await prisma.tradeInRequest.update({
        where: { id: body.id },
        data: {
          status: body.status,
          adminPrice: body.adminPrice ? Number(body.adminPrice) : undefined,
          adminComment: body.adminComment,
        },
      });
      return jsonOk(updated);
    }
    if (body.type === "order") {
      await orderService.updateStatus(body.id, body.status, admin.id);
      return jsonOk({ ok: true });
    }
    return jsonError("Unknown action", 400);
  } catch {
    return jsonError("Forbidden", 403);
  }
}
