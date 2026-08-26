import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { productId } = await req.json();
    const fav = await prisma.favorite.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: {},
      create: { userId: user.id, productId },
    });
    return jsonOk(fav, 201);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
