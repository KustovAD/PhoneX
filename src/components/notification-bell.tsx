"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@/i18n/routing";

type Notice = {
  id: string;
  titleRu: string;
  titleEn: string;
  bodyRu: string;
  bodyEn: string;
  href?: string | null;
  readAt?: string | null;
};

export function NotificationBell() {
  const { data } = useSession();
  const t = useTranslations("nav");
  const locale = useLocale();
  const [items, setItems] = useState<Notice[]>([]);

  useEffect(() => {
    if (!data?.user) return;
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((json) => setItems(json.data ?? []))
      .catch(() => undefined);
  }, [data?.user]);

  if (!data?.user) return null;
  const unread = items.filter((item) => !item.readAt).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("notifications")}>
          <Bell />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-border px-4 py-3 font-heading">{t("notifications")}</div>
        <div className="max-h-80 overflow-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">—</p>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                href={(item.href as "/account") ?? "/account"}
                className="block border-b border-border/60 px-4 py-3 hover:bg-accent/40"
              >
                <p className="text-sm">{locale === "en" ? item.titleEn : item.titleRu}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {locale === "en" ? item.bodyEn : item.bodyRu}
                </p>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
