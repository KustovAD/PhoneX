"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Listing = {
  id: string;
  model: string;
  status: string;
  price: number;
  brand: { name: string };
  user: { email: string };
};

export default function AdminListings() {
  const t = useTranslations("admin");
  const ta = useTranslations("account");
  const [items, setItems] = useState<Listing[]>([]);
  useEffect(() => {
    fetch("/api/admin/ops")
      .then((r) => r.json())
      .then((j) => setItems(j.data?.listings ?? []));
  }, []);

  async function act(id: string, status: string) {
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        note: status === "rejected" ? t("notePhotos") : t("noteApproved"),
      }),
    });
    if (res.ok) toast.success(t("updated"));
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl">{t("listings")}</h1>
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-border/70 p-4">
          <p className="font-heading">
            {item.brand.name} {item.model}
          </p>
          <p className="text-sm text-mist">
            {item.user.email} · {ta.has(item.status) ? ta(item.status as "published") : item.status} · {item.price} ₽
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => act(item.id, "published")}>
              {t("approve")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => act(item.id, "unpublished")}>
              {t("photos")}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => act(item.id, "rejected")}>
              {t("reject")}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
