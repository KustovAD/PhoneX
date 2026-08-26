import { jsonError, jsonOk } from "@/lib/api-response";
import { tradeInEvaluateSchema } from "@/lib/validations";
import { tradeInValuationService } from "@/services/trade-in-valuation.service";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0];
  if (!rateLimit(clientKey(ip, "tradein"), 20, 60_000).ok) {
    return jsonError("Too many requests", 429);
  }
  const parsed = tradeInEvaluateSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid data", 400, parsed.error.flatten());
  try {
    const result = await tradeInValuationService.evaluate(parsed.data);
    return jsonOk(result);
  } catch {
    return jsonError("Model not found", 404);
  }
}
