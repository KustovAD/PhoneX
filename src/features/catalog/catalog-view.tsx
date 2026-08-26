"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const STORAGE = [64, 128, 256, 512, 1024];
const CONDITIONS = ["new", "like_new", "excellent", "good", "used_traces"];
const BATTERY = ["95_100", "90_94", "85_89", "below_85"];

export function CatalogView({ locale, brands }: { locale: string; brands: { slug: string; name: string }[] }) {
  const t = useTranslations("catalog");
  const tp = useTranslations("product");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [pending, start] = useTransition();

  const query = params.toString();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      router.replace(`${pathname}?${next.toString()}` as never, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggleCsv = (key: string, value: string) => {
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, next.length ? next.join(",") : null);
  };

  useEffect(() => {
    start(async () => {
      const res = await fetch(`/api/products?${query}`);
      const json = await res.json();
      setItems(json.data?.items ?? []);
      setTotal(json.data?.total ?? 0);
    });
  }, [query]);

  const selected = useMemo(
    () => ({
      brand: params.get("brand")?.split(",") ?? [],
      storage: params.get("storage")?.split(",") ?? [],
      condition: params.get("condition")?.split(",") ?? [],
      battery: params.get("battery")?.split(",") ?? [],
    }),
    [params],
  );

  const filters = (
    <div className="space-y-6 text-sm">
      <fieldset>
        <legend className="mb-3 font-heading">{t("brand")}</legend>
        {brands.map((brand) => (
          <label key={brand.slug} className="mb-2 flex items-center gap-2">
            <Checkbox
              checked={selected.brand.includes(brand.slug)}
              onCheckedChange={() => toggleCsv("brand", brand.slug)}
            />
            {brand.name}
          </label>
        ))}
      </fieldset>
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="col-span-2 mb-2 font-heading">{t("price")}</legend>
        <Input
          type="number"
          placeholder={t("from")}
          defaultValue={params.get("minPrice") ?? ""}
          onBlur={(e) => setParam("minPrice", e.target.value || null)}
        />
        <Input
          type="number"
          placeholder={t("to")}
          defaultValue={params.get("maxPrice") ?? ""}
          onBlur={(e) => setParam("maxPrice", e.target.value || null)}
        />
      </fieldset>
      <fieldset>
        <legend className="mb-3 font-heading">{t("storage")}</legend>
        {STORAGE.map((size) => (
          <label key={size} className="mb-2 flex items-center gap-2">
            <Checkbox
              checked={selected.storage.includes(String(size))}
              onCheckedChange={() => toggleCsv("storage", String(size))}
            />
            {size === 1024 ? t("tb") : t("gb", { n: size })}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-3 font-heading">{t("condition")}</legend>
        {CONDITIONS.map((c) => (
          <label key={c} className="mb-2 flex items-center gap-2">
            <Checkbox
              checked={selected.condition.includes(c)}
              onCheckedChange={() => toggleCsv("condition", c)}
            />
            {tp(c as "new")}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-3 font-heading">{t("battery")}</legend>
        {BATTERY.map((b) => (
          <label key={b} className="mb-2 flex items-center gap-2">
            <Checkbox
              checked={selected.battery.includes(b)}
              onCheckedChange={() => toggleCsv("battery", b)}
            />
            {t(`battery_${b}` as "battery_95_100")}
          </label>
        ))}
      </fieldset>
      <label className="flex items-center gap-2">
        <Checkbox
          checked={params.get("inStock") === "1"}
          onCheckedChange={(v) => setParam("inStock", v ? "1" : null)}
        />
        {t("onlyInStock")}
      </label>
      <Button variant="outline" className="w-full" onClick={() => router.replace(pathname)}>
        {t("reset")}
      </Button>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[240px_1fr] md:px-6">
      <aside className="hidden md:block">{filters}</aside>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("found")}: {total}
            </p>
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  {t("filters")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-auto bg-background">
                {filters}
              </SheetContent>
            </Sheet>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={params.get("sort") ?? "newest"}
              onChange={(e) => setParam("sort", e.target.value)}
            >
              <option value="newest">{t("newest")}</option>
              <option value="price_asc">{t("cheap")}</option>
              <option value="price_desc">{t("expensive")}</option>
              <option value="popular">{t("popular")}</option>
              <option value="rating">{t("rating")}</option>
            </select>
          </div>
        </div>
        {pending && items.length === 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-3xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10">
            <EmptyState title={t("empty")} />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ProductCard key={item.id} locale={locale} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
