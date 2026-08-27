import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { prisma } from "@/db/prisma";
import { CatalogView } from "@/features/catalog/catalog-view";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const brands = await prisma.brand.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16"><Skeleton className="h-96" /></div>}>
      <CatalogView locale={locale} brands={brands} />
    </Suspense>
  );
}
