"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Product = { id: string; nameRu: string; price: number; stock: number; isPublished: boolean };

export default function AdminProducts() {
  const t = useTranslations("admin");
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => setItems(j.data?.items ?? []));
  }, []);

  async function save(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: p.price, stock: p.stock, isPublished: p.isPublished }),
    });
    toast.success(t("saved"));
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl">{t("products")}</h1>
      {items.map((p) => (
        <div key={p.id} className="grid grid-cols-[1fr_120px_80px_auto] items-center gap-3 rounded-2xl border border-border/70 p-3">
          <p>{p.nameRu}</p>
          <Input
            type="number"
            value={p.price}
            onChange={(e) =>
              setItems((all) => all.map((x) => (x.id === p.id ? { ...x, price: Number(e.target.value) } : x)))
            }
          />
          <Input
            type="number"
            value={p.stock}
            onChange={(e) =>
              setItems((all) => all.map((x) => (x.id === p.id ? { ...x, stock: Number(e.target.value) } : x)))
            }
          />
          <Button size="sm" onClick={() => save(p)}>
            {t("save")}
          </Button>
        </div>
      ))}
    </div>
  );
}
