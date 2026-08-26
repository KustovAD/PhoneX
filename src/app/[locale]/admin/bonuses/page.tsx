"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Settings = {
  registrationBonus: number;
  purchasePercent: number;
  saleBonus: number;
  tradeInBonus: number;
  reviewBonus: number;
  referralBonus: number;
  maxPayPercent: number;
  expiryDays: number;
};

type Coeff = { id: string; key: string; labelRu: string; multiplier?: number | null; deduction?: number | null };

const SETTING_KEYS = [
  "registrationBonus",
  "purchasePercent",
  "saleBonus",
  "tradeInBonus",
  "reviewBonus",
  "referralBonus",
  "maxPayPercent",
  "expiryDays",
] as const;

export default function AdminBonuses() {
  const t = useTranslations("admin");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [coeffs, setCoeffs] = useState<Coeff[]>([]);

  useEffect(() => {
    fetch("/api/admin/ops")
      .then((r) => r.json())
      .then((j) => {
        setSettings(j.data?.settings);
        setCoeffs(j.data?.coefficients ?? []);
      });
  }, []);

  if (!settings) return <p>…</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl">{t("bonusSettings")}</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {SETTING_KEYS.map((key) => (
          <label key={key} className="text-sm">
            {t(key)}
            <Input
              className="mt-1"
              type="number"
              value={settings[key]}
              onChange={(e) => setSettings({ ...settings, [key]: Number(e.target.value) })}
            />
          </label>
        ))}
      </div>
      <Button
        onClick={async () => {
          await fetch("/api/admin/ops", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "bonus", data: settings }),
          });
          toast.success(t("saved"));
        }}
      >
        {t("saveBonuses")}
      </Button>
      <h2 className="font-heading text-2xl">{t("coefficients")}</h2>
      <div className="space-y-2">
        {coeffs.map((c) => (
          <div key={c.id} className="grid grid-cols-[1fr_100px_100px] gap-2 text-sm">
            <p>{c.labelRu}</p>
            <Input
              type="number"
              step="0.01"
              value={c.multiplier ?? ""}
              onChange={(e) =>
                setCoeffs((all) => all.map((x) => (x.id === c.id ? { ...x, multiplier: Number(e.target.value) } : x)))
              }
            />
            <Input
              type="number"
              value={c.deduction ?? ""}
              onChange={(e) =>
                setCoeffs((all) => all.map((x) => (x.id === c.id ? { ...x, deduction: Number(e.target.value) } : x)))
              }
            />
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={async () => {
          for (const c of coeffs) {
            await fetch("/api/admin/ops", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "coefficient", id: c.id, multiplier: c.multiplier, deduction: c.deduction }),
            });
          }
          toast.success(t("coefficientsSaved"));
        }}
      >
        {t("saveCoefficients")}
      </Button>
    </div>
  );
}
