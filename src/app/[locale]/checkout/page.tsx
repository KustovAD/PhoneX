"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { useRouter } from "@/i18n/routing";

export default function CheckoutPage() {
  const t = useTranslations("cart");
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [bonus, setBonus] = useState(0);
  const [maxBonus, setMaxBonus] = useState(0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    fetch("/api/bonuses")
      .then((r) => r.json())
      .then((j) => {
        const cap = Math.floor((subtotal * (j.data?.settings?.maxPayPercent ?? 30)) / 100);
        setMaxBonus(Math.min(j.data?.balance ?? 0, cap, subtotal));
      });
  }, [subtotal]);

  const total = Math.max(0, subtotal - bonus);

  return (
    <form
      className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2 md:px-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contactName: form.get("contactName"),
            contactPhone: form.get("contactPhone"),
            contactEmail: form.get("contactEmail"),
            address: form.get("address"),
            comment: form.get("comment"),
            bonusToUse: bonus,
            items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? t("title"));
          return;
        }
        clear();
        toast.success(t("success"));
        router.push("/account/orders");
      }}
    >
      <div className="space-y-4">
        <h1 className="font-heading text-3xl">{t("checkout")}</h1>
        <div className="space-y-2">
          <Label>{t("name")}</Label>
          <Input name="contactName" required />
        </div>
        <div className="space-y-2">
          <Label>{t("phone")}</Label>
          <Input name="contactPhone" required />
        </div>
        <div className="space-y-2">
          <Label>{t("email")}</Label>
          <Input name="contactEmail" type="email" required />
        </div>
        <div className="space-y-2">
          <Label>{t("address")}</Label>
          <Input name="address" required />
        </div>
        <Textarea name="comment" placeholder={t("comment")} />
      </div>
      <aside className="h-fit space-y-4 rounded-3xl border border-border/70 bg-card/60 p-5">
        <p>
          {t("subtotal")}: {formatPrice(subtotal, "ru")}
        </p>
        <div>
          <Label>
            {t("bonuses")} ({t("max")} {maxBonus})
          </Label>
          <Input
            type="number"
            min={0}
            max={maxBonus}
            value={bonus}
            onChange={(e) => setBonus(Math.min(maxBonus, Number(e.target.value) || 0))}
          />
        </div>
        <p className="font-heading text-3xl">
          {t("total")}: {formatPrice(total, "ru")}
        </p>
        <Button type="submit" className="h-11 w-full" disabled={!items.length}>
          {t("checkout")}
        </Button>
      </aside>
    </form>
  );
}
