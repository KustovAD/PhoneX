import { jsonError, jsonOk } from "@/lib/api-response";
import { listingService } from "@/services/listing.service";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk(await listingService.mine(user.id));
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
