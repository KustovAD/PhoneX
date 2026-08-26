import { NextRequest } from "next/server";
import { jsonOk } from "@/lib/api-response";
import { productService } from "@/services/product.service";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const data = await productService.searchSuggest(q);
  return jsonOk(data);
}
