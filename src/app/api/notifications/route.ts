import { jsonError, jsonOk } from "@/lib/api-response";
import { notificationService } from "@/services/notification.service";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk(await notificationService.list(user.id));
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const { id } = await req.json();
    await notificationService.markRead(user.id, id);
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
