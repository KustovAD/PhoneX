"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/empty-state";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Order = {
  id: string;
  number: string;
  status: string;
  total: number;
  items: { title: string; quantity: number }[];
};

export default function OrdersPage() {
  const t = useTranslations("account");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders/my")
      .then((r) => r.json())
      .then((j) => setOrders(j.data ?? []));
  }, []);

  const group = (keys: string[]) => orders.filter((o) => keys.includes(o.status));

  const list = (items: Order[]) =>
    items.length === 0 ? (
      <EmptyState title={t("emptyOrders")} />
    ) : (
      <div className="space-y-3">
        {items.map((order) => (
          <article key={order.id} className="rounded-2xl border border-border/70 p-4">
            <div className="flex items-center justify-between">
              <p className="font-heading">{order.number}</p>
              <Badge variant="secondary">{t(`status.${order.status}` as "status.pending")}</Badge>
            </div>
            <p className="mt-2 text-sm text-mist">{order.items.map((i) => i.title).join(", ")}</p>
            <p className="mt-2">{formatPrice(order.total, "ru")}</p>
          </article>
        ))}
      </div>
    );

  return (
    <Tabs defaultValue="current">
      <TabsList>
        <TabsTrigger value="current">{t("current")}</TabsTrigger>
        <TabsTrigger value="done">{t("completed")}</TabsTrigger>
        <TabsTrigger value="cancel">{t("cancelled")}</TabsTrigger>
      </TabsList>
      <TabsContent value="current" className="mt-6">
        {list(group(["pending", "confirmed", "processing", "shipped"]))}
      </TabsContent>
      <TabsContent value="done" className="mt-6">
        {list(group(["completed"]))}
      </TabsContent>
      <TabsContent value="cancel" className="mt-6">
        {list(group(["cancelled"]))}
      </TabsContent>
    </Tabs>
  );
}
