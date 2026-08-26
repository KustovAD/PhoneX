import { jsonError, jsonOk } from "@/lib/api-response";
import { bonusService } from "@/services/bonus.service";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk(await bonusService.history(user.id));
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
