import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { productFilterSchema } from "@/lib/validations";
import { productService } from "@/services/product.service";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/db/prisma";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  const parsed = productFilterSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  const data = await productService.list(parsed.success ? parsed.data : {});
  return jsonOk(data);
}

export async function POST(req: NextRequest) {
  try {
    await requireStaff();
  } catch {
    return jsonError("Forbidden", 403);
  }
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      slug: slugify(body.nameEn || body.nameRu || "phone"),
      sku: `PX-${Date.now()}`,
      brandId: body.brandId,
      categoryId: body.categoryId,
      nameRu: body.nameRu,
      nameEn: body.nameEn,
      model: body.model,
      storageGb: Number(body.storageGb),
      colorRu: body.colorRu,
      colorEn: body.colorEn,
      colorHex: body.colorHex ?? "#1C1C1E",
      condition: body.condition ?? "new",
      batteryHealth: Number(body.batteryHealth ?? 100),
      price: Number(body.price),
      oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
      stock: Number(body.stock ?? 1),
      isPublished: body.isPublished ?? true,
    },
  });
  return jsonOk(product, 201);
}
