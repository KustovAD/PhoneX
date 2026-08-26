import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";
import { userService } from "@/services/user.service";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(clientKey(ip, "register"), 8, 60_000).ok) {
    return jsonError("Too many requests", 429);
  }
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid data", 400, parsed.error.flatten());
  try {
    const { user, verifyToken } = await userService.register(parsed.data);
    return jsonOk({
      id: user.id,
      email: user.email,
      verifyUrl: `/verify-email?token=${verifyToken}`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return jsonError("User already exists", 409);
    }
    return jsonError("Unable to register", 500);
  }
}
