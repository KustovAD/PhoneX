"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Stats = {
  users: number;
  newUsers: number;
  orders: number;
  sales: number;
  turnover: number;
  products: number;
  pendingListings: number;
  tradeIns: number;
};

export default function AdminHome() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((j) => setStats(j.data));
  }, []);
  if (!stats) return <p>…</p>;
  const cards = [
    [t("users"), stats.users],
    [t("newUsers"), stats.newUsers],
    [t("orders"), stats.orders],
    [t("sales"), stats.sales],
    [t("turnover"), stats.turnover],
    [t("products"), stats.products],
    [t("pendingListings"), stats.pendingListings],
    [t("tradeIn"), stats.tradeIns],
  ] as const;
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-border/70 bg-card/60 p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-heading text-3xl">{Number(value).toLocaleString("ru-RU")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
