import { jsonError, jsonOk } from "@/lib/api-response";
import { listingService } from "@/services/listing.service";
import { requireStaff, requireUser } from "@/lib/session";
import { prisma } from "@/db/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  try {
    if (body.status) {
      const staff = await requireStaff();
      const updated = await listingService.moderate(id, body.status, staff.id, body.note);
      return jsonOk(updated);
    }
    const user = await requireUser();
    const listing = await prisma.userListing.findUnique({ where: { id } });
    if (!listing || listing.userId !== user.id) return jsonError("Forbidden", 403);
    const updated = await prisma.userListing.update({
      where: { id },
      data: { price: body.price ? Number(body.price) : undefined, status: body.unpublish ? "unpublished" : undefined },
    });
    return jsonOk(updated);
  } catch {
    return jsonError("Forbidden", 403);
  }
}
