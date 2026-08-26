import { jsonError, jsonOk } from "@/lib/api-response";
import { reviewSchema } from "@/lib/validations";
import { reviewService } from "@/services/review.service";
import { requireUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const parsed = reviewSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid data", 400);
    const review = await reviewService.create(
      user.id,
      parsed.data.productId,
      parsed.data.rating,
      parsed.data.text,
    );
    return jsonOk(review, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "UNAUTHORIZED") return jsonError("Unauthorized", 401);
    return jsonError(message, 400);
  }
}
