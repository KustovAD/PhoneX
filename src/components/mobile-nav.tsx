"use client";

import { useTranslations } from "next-intl";
import { Home, LayoutGrid, Repeat2, ShoppingBag, UserRound } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", key: "home", icon: Home },
  { href: "/catalog", key: "catalog", icon: LayoutGrid },
  { href: "/trade-in", key: "tradeIn", icon: Repeat2 },
  { href: "/cart", key: "cart", icon: ShoppingBag },
  { href: "/account", key: "account", icon: UserRound },
] as const;

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/90 px-2 py-2 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 text-[11px]",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
