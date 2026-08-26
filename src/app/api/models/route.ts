import { jsonOk } from "@/lib/api-response";
import { prisma } from "@/db/prisma";

export async function GET(req: Request) {
  const brand = new URL(req.url).searchParams.get("brand");
  const models = await prisma.phoneModel.findMany({
    where: brand ? { brand: { slug: brand } } : undefined,
    include: { brand: true },
    orderBy: { year: "desc" },
  });
  return jsonOk(models);
}
