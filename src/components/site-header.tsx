"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchDialog } from "@/components/search-dialog";
import { NotificationBell } from "@/components/notification-bell";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "/catalog", key: "catalog" },
  { href: "/catalog?brand=apple,samsung,xiaomi,google,oneplus", key: "phones" },
  { href: "/accessories", key: "accessories" },
  { href: "/trade-in", key: "tradeIn" },
  { href: "/promotions", key: "promos" },
  { href: "/about", key: "about" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const cartCount = useCart((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const favCount = useFavorites((s) => s.ids.length);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-[4.25rem] md:px-6">
        <div className="flex items-center gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background">
              <Link href="/" className="font-heading text-xl">
                PhoneX
              </Link>
              <nav className="mt-8 flex flex-col gap-4">
                {NAV.map((item) => (
                  <Link key={item.key} href={item.href} className="text-lg text-mist hover:text-foreground">
                    {t(item.key)}
                  </Link>
                ))}
                <Link href="/sell" className="text-lg text-primary">
                  {t("sell")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-heading text-xl tracking-tight md:text-2xl">
            Phone<span className="text-primary">X</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-mist lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`transition hover:text-foreground ${pathname.startsWith(item.href.split("?")[0]) ? "text-foreground" : ""}`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label={t("search")}>
            <Search />
          </Button>
          <NotificationBell />
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/account/favorites" aria-label={t("favorites")}>
              <Heart />
              {favCount > 0 ? <Count>{favCount}</Count> : null}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label={t("cart")}>
              <ShoppingBag />
              {cartCount > 0 ? <Count>{cartCount}</Count> : null}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account" aria-label={t("account")}>
              <UserRound />
            </Link>
          </Button>
          <Button asChild className="hidden h-9 px-4 lg:inline-flex">
            <Link href="/sell">{t("sell")}</Link>
          </Button>
        </div>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

function Count({ children }: { children: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
      {children}
    </span>
  );
}
