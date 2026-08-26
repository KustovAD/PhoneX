"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Tx = { id: string; amount: number; description: string; createdAt: string };

export default function BonusesPage() {
  const t = useTranslations("account");
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Tx[]>([]);
  const [settings, setSettings] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch("/api/bonuses")
      .then((r) => r.json())
      .then((j) => {
        setBalance(j.data?.balance ?? 0);
        setSettings(j.data?.settings ?? null);
      });
    fetch("/api/bonuses/history")
      .then((r) => r.json())
      .then((j) => setHistory(j.data ?? []));
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border/70 bg-card/60 p-6">
        <p className="text-sm text-muted-foreground">{t("balance")}</p>
        <p className="mt-2 font-heading text-4xl">
          {balance.toLocaleString("ru-RU")} {t("bonusesUnit")}
        </p>
      </div>
      {settings ? (
        <div className="rounded-3xl border border-border/70 p-6 text-sm text-mist">
          <h2 className="mb-3 font-heading text-xl text-foreground">{t("rules")}</h2>
          <ul className="space-y-1">
            <li>+{settings.registrationBonus} · {t("ruleRegistration")}</li>
            <li>{settings.purchasePercent}% · {t("rulePurchase")}</li>
            <li>+{settings.saleBonus} · {t("ruleSale")}</li>
            <li>+{settings.tradeInBonus} · {t("ruleTradeIn")}</li>
            <li>+{settings.reviewBonus} · {t("ruleReview")}</li>
            <li>+{settings.referralBonus} · {t("ruleReferral")}</li>
            <li>{t("ruleMaxPay", { n: settings.maxPayPercent })}</li>
          </ul>
        </div>
      ) : null}
      <div>
        <h2 className="font-heading text-xl">{t("history")}</h2>
        <ul className="mt-4 divide-y divide-border/60">
          {history.map((tx) => (
            <li key={tx.id} className="flex justify-between py-3 text-sm">
              <span>{tx.description}</span>
              <span className={tx.amount >= 0 ? "text-success" : "text-destructive"}>
                {tx.amount > 0 ? "+" : ""}
                {tx.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
