"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";

function ResetInner() {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const router = useRouter();

  return (
    <form
      className="mx-auto max-w-md space-y-4 px-4 py-16"
      onSubmit={async (e) => {
        e.preventDefault();
        const password = String(new FormData(e.currentTarget).get("password"));
        const res = await fetch("/api/auth/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: params.get("token"), password }),
        });
        if (!res.ok) {
          toast.error(t("verifyBad"));
          return;
        }
        router.push("/login");
      }}
    >
      <h1 className="font-heading text-3xl">{t("newPassword")}</h1>
      <Input name="password" type="password" minLength={8} required />
      <Button type="submit" className="h-11 w-full">
        {t("savePassword")}
      </Button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}
