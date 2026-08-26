import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { userService } from "@/services/user.service";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(clientKey(ip, "forgot"), 5, 60_000).ok) {
    return jsonError("Too many requests", 429);
  }
  const { identifier } = await req.json();
  const result = await userService.requestPasswordReset(String(identifier ?? ""));
  return jsonOk({
    previewUrl: result ? `/reset-password?token=${result.token}` : null,
  });
}
