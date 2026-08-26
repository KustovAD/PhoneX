import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { checkoutSchema } from "@/lib/validations";
import { orderService } from "@/services/order.service";
import { requireUser } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(clientKey(ip, "order"), 10, 60_000).ok) {
      return jsonError("Too many requests", 429);
    }
    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid data", 400, parsed.error.flatten());
    const order = await orderService.create(user.id, parsed.data);
    return jsonOk(order, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "UNAUTHORIZED") return jsonError("Unauthorized", 401);
    return jsonError(message, 400);
  }
}
