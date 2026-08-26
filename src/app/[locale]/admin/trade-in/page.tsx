"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Req = {
  id: string;
  modelName: string;
  status: string;
  adminPrice?: number | null;
  valuation?: { estimated: number } | null;
};

export default function AdminTradeIn() {
  const t = useTranslations("admin");
  const [items, setItems] = useState<Req[]>([]);
  useEffect(() => {
    fetch("/api/admin/ops")
      .then((r) => r.json())
      .then((j) => setItems(j.data?.tradeIns ?? []));
  }, []);

  async function save(item: Req, status: string) {
    await fetch("/api/admin/ops", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "tradein",
        id: item.id,
        status,
        adminPrice: item.adminPrice,
        adminComment: t("noteReviewed"),
      }),
    });
    toast.success(t("updated"));
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl">{t("tradeIn")}</h1>
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-border/70 p-4">
          <p className="font-heading">{item.modelName}</p>
          <p className="text-sm text-mist">
            {t("estimate")} {item.valuation?.estimated} · {item.status}
          </p>
          <Input
            className="mt-3 max-w-xs"
            type="number"
            placeholder={t("finalPrice")}
            onChange={(e) =>
              setItems((all) => all.map((x) => (x.id === item.id ? { ...x, adminPrice: Number(e.target.value) } : x)))
            }
          />
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => save(item, "accepted")}>
              {t("accept")}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => save(item, "rejected")}>
              {t("reject")}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
