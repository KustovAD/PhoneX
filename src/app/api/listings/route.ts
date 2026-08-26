import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { listingSchema } from "@/lib/validations";
import { listingService } from "@/services/listing.service";
import { requireUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = listingSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid data", 400, parsed.error.flatten());
    const listing = await listingService.create(user.id, parsed.data);
    return jsonOk(listing, 201);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
