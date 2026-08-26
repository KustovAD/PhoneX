"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  image?: string | null;
  profile?: { city?: string | null; bio?: string | null; avatar?: string | null };
};

export default function AccountPage() {
  const t = useTranslations("account");
  const ta = useTranslations("auth");
  const [data, setData] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((j) => setData(j.data));
  }, []);

  if (!data) return <p className="text-muted-foreground">{t("title")}…</p>;

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            phone: form.get("phone"),
            city: form.get("city"),
            bio: form.get("bio"),
          }),
        });
        if (res.ok) toast.success(t("saved"));
      }}
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={data.profile?.avatar ?? data.image ?? ""} />
          <AvatarFallback>
            {data.firstName[0]}
            {data.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-heading text-2xl">
            {data.firstName} {data.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("joined")}: {formatDate(data.createdAt, "ru")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>{ta("firstName")}</Label>
          <Input name="firstName" defaultValue={data.firstName} />
        </div>
        <div className="space-y-2">
          <Label>{ta("lastName")}</Label>
          <Input name="lastName" defaultValue={data.lastName} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{ta("email")}</Label>
        <Input defaultValue={data.email} disabled />
      </div>
      <div className="space-y-2">
        <Label>{ta("phone")}</Label>
        <Input name="phone" defaultValue={data.phone ?? ""} />
      </div>
      <div className="space-y-2">
        <Label>{t("city")}</Label>
        <Input name="city" defaultValue={data.profile?.city ?? ""} />
      </div>
      <Textarea name="bio" defaultValue={data.profile?.bio ?? ""} placeholder={t("bio")} />
      <div className="flex gap-3">
        <Button type="submit">{t("save")}</Button>
        <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          {ta("logout")}
        </Button>
      </div>
    </form>
  );
}
