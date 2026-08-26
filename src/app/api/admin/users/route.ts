import { jsonError, jsonOk } from "@/lib/api-response";
import { requireAdmin, requireStaff } from "@/lib/session";
import { userService } from "@/services/user.service";
import { prisma } from "@/db/prisma";
import { bonusService } from "@/services/bonus.service";

export async function GET() {
  try {
    await requireStaff();
    const users = await prisma.user.findMany({
      include: { role: true, bonusAccount: true, profile: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(users);
  } catch {
    return jsonError("Forbidden", 403);
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    const { userId, action, role } = await req.json();
    if (action === "block") await userService.setBlocked(userId, true, admin.id);
    if (action === "unblock") await userService.setBlocked(userId, false, admin.id);
    if (action === "role") await userService.setRole(userId, role, admin.id);
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Forbidden", 403);
  }
}

void bonusService;
