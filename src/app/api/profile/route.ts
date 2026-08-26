import { jsonError, jsonOk } from "@/lib/api-response";
import { profileSchema } from "@/lib/validations";
import { userService } from "@/services/user.service";
import { requireUser } from "@/lib/session";
import { prisma } from "@/db/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    const full = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true, role: true, bonusAccount: true },
    });
    return jsonOk(full);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const parsed = profileSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid data", 400);
    await userService.updateProfile(user.id, parsed.data);
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
