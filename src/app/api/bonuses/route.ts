import { jsonError, jsonOk } from "@/lib/api-response";
import { bonusService } from "@/services/bonus.service";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();
    const [account, settings] = await Promise.all([
      bonusService.account(user.id),
      bonusService.settings(),
    ]);
    return jsonOk({ balance: account.balance, settings });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
