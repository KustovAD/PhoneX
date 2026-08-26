"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="mx-auto w-full max-w-md space-y-4 rounded-3xl border border-border/70 bg-card/60 p-6 md:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setLoading(true);
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            email: form.get("email"),
            phone: form.get("phone"),
            password: form.get("password"),
            confirmPassword: form.get("confirmPassword"),
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setLoading(false);
          toast.error(json.error ?? t("registerError"));
          return;
        }
        await signIn("credentials", {
          identifier: String(form.get("email")),
          password: String(form.get("password")),
          redirect: false,
        });
        setLoading(false);
        toast.success(t("verifyTitle"));
        router.push("/account");
      }}
    >
      <h1 className="font-heading text-3xl">{t("registerTitle")}</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("firstName")}</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("lastName")}</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input id="phone" name="phone" required placeholder="+7" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirm")}</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={loading}>
        {t("submitRegister")}
      </Button>
      <p className="text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-primary">
          {t("submitLogin")}
        </Link>
      </p>
    </form>
  );
}
