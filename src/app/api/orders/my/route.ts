import { jsonError, jsonOk } from "@/lib/api-response";
import { orderService } from "@/services/order.service";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk(await orderService.mine(user.id));
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
