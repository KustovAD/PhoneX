import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { prisma } from "@/db/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.tradeInRequest.findMany({
      where: { userId: user.id },
      include: { valuation: true, conditions: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(items);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
