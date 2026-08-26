import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { userService } from "@/services/user.service";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password || String(password).length < 8) {
    return jsonError("Invalid data", 400);
  }
  try {
    await userService.resetPassword(String(token), String(password));
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Invalid token", 400);
  }
}
