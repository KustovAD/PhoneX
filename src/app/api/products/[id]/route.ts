import { jsonError, jsonOk } from "@/lib/api-response";
import { productService } from "@/services/product.service";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/db/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, images: true },
  });
  if (!product) return jsonError("Not found", 404);
  return jsonOk(product);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaff();
  } catch {
    return jsonError("Forbidden", 403);
  }
  const { id } = await params;
  const body = await req.json();
  const images = Array.isArray(body.images)
    ? body.images.filter((url: unknown): url is string => typeof url === "string" && url.startsWith("/"))
    : undefined;
  const product = await prisma.product.update({
    where: { id },
    data: {
      price: body.price !== undefined ? Number(body.price) : undefined,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      isPublished: body.isPublished,
      nameRu: body.nameRu,
      nameEn: body.nameEn,
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images.map((url: string, sortOrder: number) => ({ url, sortOrder })),
            },
          }
        : {}),
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  return jsonOk(product);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaff();
  } catch {
    return jsonError("Forbidden", 403);
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

void productService;
