"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPage() {
  const t = useTranslations("auth");
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="mx-auto max-w-md px-4 py-20 text-center text-mist">{t("resetDone")}</p>;
  }

  return (
    <form
      className="mx-auto max-w-md space-y-4 px-4 py-16"
      onSubmit={async (e) => {
        e.preventDefault();
        const identifier = String(new FormData(e.currentTarget).get("identifier"));
        const res = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier }),
        });
        const json = await res.json();
        setDone(true);
        if (json.data?.previewUrl) {
          toast.message(json.data.previewUrl);
        }
      }}
    >
      <h1 className="font-heading text-3xl">{t("resetTitle")}</h1>
      <Label htmlFor="identifier">{t("identifier")}</Label>
      <Input id="identifier" name="identifier" required />
      <Button type="submit" className="h-11 w-full">
        {t("resetSend")}
      </Button>
    </form>
  );
}
