"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { ValuationResult } from "@/types";

type Model = { slug: string; name: string; year: number; brand: { slug: string; name: string } };

const STEPS = 12;

export default function TradeInPage() {
  const t = useTranslations("tradeIn");
  const tk = useTranslations("kit");
  const tc = useTranslations("catalog");
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<{ slug: string; name: string }[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [form, setForm] = useState({
    brandSlug: "",
    modelSlug: "",
    storageGb: 128,
    batteryHealth: 95,
    screen: "clean",
    body: "perfect",
    cameras: "perfect",
    biometrics: "works",
    speakers: "works",
    charging: "perfect",
    repairs: [] as string[],
    kit: ["box", "cable", "charger", "documents"] as string[],
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [result, setResult] = useState<ValuationResult | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(async () => {
        const res = await fetch("/api/models");
        const json = await res.json();
        const list = json.data as Model[];
        setModels(list);
        const unique = Array.from(new Map(list.map((m) => [m.brand.slug, m.brand])).values());
        setBrands(unique);
      });
  }, []);

  const brandModels = useMemo(
    () => models.filter((m) => m.brand.slug === form.brandSlug),
    [models, form.brandSlug],
  );

  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  const choice = (value: string, current: string, onPick: () => void, label?: string) => (
    <button
      type="button"
      onClick={onPick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
        current === value ? "border-primary bg-accent/40" : "border-border/70 hover:border-primary/40"
      }`}
    >
      {label ?? value}
    </button>
  );

  async function evaluate() {
    const res = await fetch("/api/trade-in/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error);
      return;
    }
    setResult(json.data);
    setStep(13);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl">{t("title")}</h1>
      <p className="mt-3 text-mist">{t("subtitle")}</p>
      {step <= 12 ? (
        <p className="mt-6 text-sm text-beige">
          {t("step")} {step} / {STEPS}
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {brands.map((b) => (
              <button
                key={b.slug}
                type="button"
                onClick={() => set({ brandSlug: b.slug })}
                className={`rounded-2xl border px-4 py-6 ${form.brandSlug === b.slug ? "border-primary" : "border-border/70"}`}
              >
                {b.name}
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3">
            {brandModels.map((m) => (
              <button
                key={m.slug}
                type="button"
                onClick={() => set({ modelSlug: m.slug })}
                className={`rounded-2xl border px-4 py-4 text-left ${form.modelSlug === m.slug ? "border-primary" : "border-border/70"}`}
              >
                {m.name} · {m.year}
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="grid grid-cols-2 gap-3">
            {[64, 128, 256, 512, 1024].map((n) =>
              choice(String(n), String(form.storageGb), () => set({ storageGb: n }), n === 1024 ? tc("tb") : tc("gb", { n })),
            )}
          </div>
        )}
        {step === 4 && (
          <div className="grid grid-cols-3 gap-3">
            {[100, 98, 95, 91, 87, 82].map((n) =>
              choice(`${n}%`, `${form.batteryHealth}%`, () => set({ batteryHealth: n })),
            )}
          </div>
        )}
        {step === 5 && (
          <div className="grid gap-3">
            {["clean", "light_scratches", "deep_scratches", "chips", "cracks", "replaced"].map((v) =>
              choice(v, form.screen, () => set({ screen: v }), t(`screen.${v}`)),
            )}
          </div>
        )}
        {step === 6 && (
          <div className="grid gap-3">
            {["perfect", "light_wear", "visible_scratches", "chips", "dents", "cracks"].map((v) =>
              choice(v, form.body, () => set({ body: v }), t(`body.${v}`)),
            )}
          </div>
        )}
        {step === 7 && (
          <div className="grid gap-3">
            {["perfect", "issues", "glass_damage"].map((v) =>
              choice(v, form.cameras, () => set({ cameras: v }), t(`cameras.${v}`)),
            )}
          </div>
        )}
        {step === 8 && (
          <div className="grid gap-3">
            {["works", "partial", "broken"].map((v) =>
              choice(v, form.biometrics, () => set({ biometrics: v }), t(`biometrics.${v}`)),
            )}
          </div>
        )}
        {step === 9 && (
          <div className="grid gap-3">
            {["works", "issues"].map((v) => choice(v, form.speakers, () => set({ speakers: v }), t(`speakers.${v}`)))}
          </div>
        )}
        {step === 10 && (
          <div className="grid gap-3">
            {["perfect", "unstable", "broken"].map((v) =>
              choice(v, form.charging, () => set({ charging: v }), t(`charging.${v}`)),
            )}
          </div>
        )}
        {step === 11 && (
          <div className="grid gap-3">
            {["none", "screen", "battery", "body", "other"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() =>
                  set({
                    repairs: v === "none" ? ["none"] : form.repairs.includes(v) ? form.repairs.filter((x) => x !== v && x !== "none") : [...form.repairs.filter((x) => x !== "none"), v],
                  })
                }
                className={`rounded-2xl border px-4 py-3 ${form.repairs.includes(v) ? "border-primary" : "border-border/70"}`}
              >
                {t(`repairs.${v}`)}
              </button>
            ))}
          </div>
        )}
        {step === 12 && (
          <div className="grid gap-3">
            {["box", "cable", "charger", "documents"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() =>
                  set({
                    kit: form.kit.includes(v) ? form.kit.filter((x) => x !== v) : [...form.kit, v],
                  })
                }
                className={`rounded-2xl border px-4 py-3 ${form.kit.includes(v) ? "border-primary" : "border-border/70"}`}
              >
                {tk(v)}
              </button>
            ))}
          </div>
        )}
        {step === 13 && result && (
          <div className="rounded-3xl border border-border/70 bg-card/60 p-6">
            <p className="text-sm text-muted-foreground">{t("result")}</p>
            <p className="mt-2 font-heading text-5xl">{formatPrice(result.estimated, locale)}</p>
            <p className="mt-2 text-mist">
              {t("range")}: {formatPrice(result.estimatedMin, locale)}–{formatPrice(result.estimatedMax, locale)}
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {result.breakdown.map((line) => (
                <li key={line.key} className="flex justify-between">
                  <span>{locale === "en" ? line.labelEn : line.labelRu}</span>
                  <span>
                    {line.amount > 0 && line.key !== "base" ? "+" : ""}
                    {formatPrice(line.amount, locale)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3">
              <input className="h-10 rounded-lg border bg-transparent px-3" placeholder={t("name")} value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} />
              <input className="h-10 rounded-lg border bg-transparent px-3" placeholder={t("phone")} value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
              <input className="h-10 rounded-lg border bg-transparent px-3" placeholder={t("email")} value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
            </div>
            <Button
              className="mt-6 h-11"
              onClick={async () => {
                const res = await fetch("/api/trade-in/request", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form),
                });
                if (res.ok) toast.success(t("submitted"));
              }}
            >
              {t("cta")}
            </Button>
          </div>
        )}
      </div>

      {step <= 12 ? (
        <div className="mt-8 flex gap-3">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              {t("back")}
            </Button>
          ) : null}
          {step < 12 ? (
            <Button onClick={() => setStep((s) => s + 1)}>{t("next")}</Button>
          ) : (
            <Button onClick={evaluate}>{t("estimate")}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
