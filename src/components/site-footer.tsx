import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function SiteFooter() {
  const t = useTranslations("nav");
  const f = useTranslations("footer");

  return (
    <footer className="mt-20 border-t border-border/70 bg-tide/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <p className="font-heading text-2xl">
            Phone<span className="text-primary">X</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {f("tagline")}
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <Link href="/catalog" className="block text-mist hover:text-foreground">{t("catalog")}</Link>
          <Link href="/trade-in" className="block text-mist hover:text-foreground">{t("tradeIn")}</Link>
          <Link href="/sell" className="block text-mist hover:text-foreground">{t("sell")}</Link>
        </div>
        <div className="space-y-2 text-sm">
          <Link href="/about" className="block text-mist hover:text-foreground">{t("about")}</Link>
          <Link href="/promotions" className="block text-mist hover:text-foreground">{t("promos")}</Link>
          <Link href="/account" className="block text-mist hover:text-foreground">{t("account")}</Link>
        </div>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} PhoneX</p>
      </div>
    </footer>
  );
}
