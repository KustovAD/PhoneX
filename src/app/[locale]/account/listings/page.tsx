"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

type Listing = {
  id: string;
  model: string;
  price: number;
  status: string;
  brand: { name: string };
};

export default function ListingsPage() {
  const t = useTranslations("account");
  const [items, setItems] = useState<Listing[]>([]);

  useEffect(() => {
    fetch("/api/listings/my")
      .then((r) => r.json())
      .then((j) => setItems(j.data ?? []));
  }, []);

  if (!items.length) {
    return (
      <div>
        <EmptyState title={t("emptyListings")} />
        <Button asChild className="mt-4">
          <Link href="/sell">{t("sellCta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="flex items-center justify-between rounded-2xl border border-border/70 p-4">
          <div>
            <p className="font-heading">
              {item.brand.name} {item.model}
            </p>
            <p className="text-sm text-mist">{formatPrice(item.price, "ru")}</p>
          </div>
          <Badge>{t(item.status as "published")}</Badge>
        </article>
      ))}
    </div>
  );
}
