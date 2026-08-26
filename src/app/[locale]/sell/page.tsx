"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import { useRouter } from "@/i18n/routing";

const DEFECTS = [
  "scratches",
  "chips",
  "cracks",
  "body_damage",
  "screen_damage",
  "burn_in",
  "repair_traces",
  "screen_replaced",
  "battery_replaced",
  "other_parts_replaced",
] as const;

const KIT = ["box", "charger", "cable", "documents", "case"] as const;
const CONDITIONS = ["new", "like_new", "excellent", "good", "used_traces"] as const;

export default function SellPage() {
  const t = useTranslations("sell");
  const tp = useTranslations("product");
  const tk = useTranslations("kit");
  const tc = useTranslations("catalog");
  const router = useRouter();
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState(48000);
  const [recommended, setRecommended] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((j) => {
        const unique = Array.from(
          new Map((j.data as { brand: { id: string; name: string; slug: string } }[]).map((m) => [m.brand.id, m.brand])).values(),
        );
        setBrands(unique);
      });
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const form = new FormData();
    Array.from(files).forEach((file) => form.append("files", file));
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error);
      return;
    }
    setImages((prev) => [...prev, ...json.data.map((f: { url: string }) => f.url)]);
  }

  return (
    <form
      className="mx-auto max-w-3xl space-y-8 px-4 py-12 md:px-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const defects: Record<string, boolean> = {};
        DEFECTS.forEach((key) => {
          defects[key] = form.get(key) === "on";
        });
        setLoading(true);
        const res = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId: form.get("brandId"),
            model: form.get("model"),
            version: form.get("version"),
            storageGb: Number(form.get("storageGb")),
            color: form.get("color"),
            imei: form.get("imei"),
            region: form.get("region"),
            purchaseDate: form.get("purchaseDate"),
            condition: form.get("condition"),
            batteryHealth: Number(form.get("batteryHealth")),
            chargeCycles: form.get("chargeCycles") ? Number(form.get("chargeCycles")) : undefined,
            defects,
            kit: form.getAll("kit"),
            price,
            images,
          }),
        });
        setLoading(false);
        if (!res.ok) {
          toast.error(t("formError"));
          return;
        }
        const json = await res.json();
        setRecommended(json.data?.recommendedPrice ?? null);
        toast.success(t("success"));
        router.push("/account/listings");
      }}
    >
      <div>
        <h1 className="font-heading text-4xl">{t("title")}</h1>
        <p className="mt-3 text-mist">{t("subtitle")}</p>
      </div>

      <section className="space-y-3 rounded-3xl border border-border/70 p-5">
        <h2 className="font-heading text-xl">{t("basic")}</h2>
        <Label>{t("brand")}</Label>
        <select name="brandId" required className="h-10 w-full rounded-lg border bg-background px-3">
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <Input name="model" placeholder={t("model")} required />
        <Input name="version" placeholder={t("version")} />
        <select name="storageGb" className="h-10 w-full rounded-lg border bg-background px-3">
          {[64, 128, 256, 512, 1024].map((n) => (
            <option key={n} value={n}>
              {n === 1024 ? tc("tb") : tc("gb", { n })}
            </option>
          ))}
        </select>
        <Input name="color" placeholder={t("color")} required />
        <Input name="imei" placeholder={t("imei")} required minLength={14} />
        <Input name="region" placeholder={t("region")} />
        <Input name="purchaseDate" type="date" aria-label={t("purchaseDate")} />
      </section>

      <section className="space-y-3 rounded-3xl border border-border/70 p-5">
        <h2 className="font-heading text-xl">{t("condition")}</h2>
        <select name="condition" className="h-10 w-full rounded-lg border bg-background px-3">
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {tp(c)}
            </option>
          ))}
        </select>
        <Label>{t("batteryHealth")}</Label>
        <Input name="batteryHealth" type="number" defaultValue={95} min={1} max={100} />
        <Input name="chargeCycles" type="number" placeholder={t("cycles")} />
      </section>

      <section className="space-y-3 rounded-3xl border border-border/70 p-5">
        <h2 className="font-heading text-xl">{t("exterior")}</h2>
        {DEFECTS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={key} className="size-4 accent-[#3a7d96]" /> {t(`defects.${key}`)}
          </label>
        ))}
      </section>

      <section className="space-y-3 rounded-3xl border border-border/70 p-5">
        <h2 className="font-heading text-xl">{t("kit")}</h2>
        {KIT.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="kit" value={key} defaultChecked={key !== "case"} className="size-4 accent-[#3a7d96]" /> {tk(key)}
          </label>
        ))}
      </section>

      <section
        className="rounded-3xl border border-dashed border-border p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void onFiles(e.dataTransfer.files);
        }}
      >
        <h2 className="font-heading text-xl">{t("photos")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("drop")} · {t("front")}, {t("back")}, {t("display")}, {t("sides")}
        </p>
        <Input type="file" accept="image/*" multiple className="mt-4" onChange={(e) => void onFiles(e.target.files)} />
        <div className="mt-4 grid grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className="h-20 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-border/70 p-5">
        <h2 className="font-heading text-xl">{t("price")}</h2>
        <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        {recommended ? (
          <p className="text-sm text-beige">
            {t("recommended")}: {formatPrice(recommended, "ru")}
          </p>
        ) : null}
      </section>

      <Button type="submit" className="h-12 w-full" disabled={loading || images.length < 1}>
        {t("submit")}
      </Button>
    </form>
  );
}
