import { jsonError, jsonOk } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { saveUpload } from "@/lib/storage";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0];
    if (!rateLimit(clientKey(ip, "upload"), 20, 60_000).ok) {
      return jsonError("Too many requests", 429);
    }
    const form = await req.formData();
    const files = form.getAll("files").filter((item): item is File => item instanceof File);
    if (!files.length) return jsonError("No files", 400);
    const stored = [];
    for (const file of files.slice(0, 8)) {
      stored.push(await saveUpload(file, user.id));
    }
    return jsonOk(stored, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return jsonError(message, 400);
  }
}
