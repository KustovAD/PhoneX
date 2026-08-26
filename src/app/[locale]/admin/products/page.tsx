"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductPhoto } from "@/components/product-photo";
import { toast } from "sonner";

type Product = {
  id: string;
  nameRu: string;
  price: number;
  stock: number;
  isPublished: boolean;
  images: { id: string; url: string }[];
};

export default function AdminProducts() {
  const t = useTranslations("admin");
  const [items, setItems] = useState<Product[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/products?scope=admin");
    const json = await res.json();
    setItems(json.data?.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: p.price, stock: p.stock, isPublished: p.isPublished }),
    });
    toast.success(t("saved"));
  }

  async function saveImages(id: string, urls: string[]) {
    setBusyId(id);
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: urls }),
    });
    setBusyId(null);
    if (!res.ok) {
      toast.error(t("photoError"));
      return;
    }
    toast.success(t("saved"));
    await load();
  }

  async function onFiles(product: Product, files: FileList | null) {
    if (!files?.length) return;
    setBusyId(product.id);
    const form = new FormData();
    for (const file of Array.from(files).slice(0, 8)) form.append("files", file);
    const up = await fetch("/api/uploads", { method: "POST", body: form });
    const json = await up.json();
    setBusyId(null);
    if (!up.ok) {
      toast.error(json.error ?? t("photoError"));
      return;
    }
    const urls = (json.data as { url: string }[]).map((item) => item.url);
    await saveImages(product.id, [...product.images.map((image) => image.url), ...urls]);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl">{t("products")}</h1>
        <p className="mt-2 text-sm text-mist">{t("photoHint")}</p>
      </div>
      {items.map((p) => (
        <div key={p.id} className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4">
          <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_120px_80px_auto]">
            <p className="font-heading">{p.nameRu}</p>
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
          <div className="flex flex-wrap gap-3">
            {p.images.map((image) => (
              <div key={image.id} className="relative">
                <ProductPhoto src={image.url} alt="" className="h-24 w-24 rounded-xl border border-border/70" sizes="96px" fit="cover" />
                <button
                  type="button"
                  className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
                  onClick={() => saveImages(p.id, p.images.filter((row) => row.id !== image.id).map((row) => row.url))}
                  aria-label={t("removePhoto")}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-beige/60 bg-secondary/50 text-beige">
              <ImagePlus className="size-5" />
              <span className="px-1 text-center text-[10px] uppercase tracking-wider">{t("addPhotos")}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={busyId === p.id}
                onChange={(e) => {
                  void onFiles(p, e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
