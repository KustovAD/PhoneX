import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { prisma } from "@/db/prisma";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await prisma.favorite.deleteMany({ where: { userId: user.id, productId: id } });
    return jsonOk({ deleted: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
