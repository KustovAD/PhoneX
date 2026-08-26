"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { useFavorites } from "@/hooks/use-favorites";

export default function FavoritesPage() {
  const t = useTranslations("account");
  const locale = useLocale();
  const ids = useFavorites((s) => s.ids);
  const [items, setItems] = useState<ProductCardData[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => {
        const all = (j.data?.items ?? []) as ProductCardData[];
        setItems(all.filter((p) => ids.includes(p.id)));
      });
  }, [ids]);

  if (!items.length) return <EmptyState title={t("emptyFav")} />;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((item) => (
        <ProductCard key={item.id} locale={locale} product={item} />
      ))}
    </div>
  );
}
