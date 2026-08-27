import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/db/prisma";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function PromotionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("promos");
  const products = await prisma.product.findMany({
    where: { isPublished: true, oldPrice: { not: null } },
    include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
    take: 12,
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl">{t("title")}</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} locale={locale} product={p} />
        ))}
      </div>
    </div>
  );
}
