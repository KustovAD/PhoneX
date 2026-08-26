"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
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
        const result = await signIn("credentials", {
          identifier: String(form.get("identifier")),
          password: String(form.get("password")),
          redirect: false,
        });
        setLoading(false);
        if (result?.error) {
          toast.error(t("loginError"));
          return;
        }
        router.push("/account");
        router.refresh();
      }}
    >
      <h1 className="font-heading text-3xl">{t("loginTitle")}</h1>
      <div className="space-y-2">
        <Label htmlFor="identifier">{t("identifier")}</Label>
        <Input id="identifier" name="identifier" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Link href="/forgot-password" className="block text-sm text-primary">
        {t("forgot")}
      </Link>
      <Button type="submit" className="h-11 w-full" disabled={loading}>
        {t("submitLogin")}
      </Button>
      <p className="text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-primary">
          {t("submitRegister")}
        </Link>
      </p>
    </form>
  );
}
