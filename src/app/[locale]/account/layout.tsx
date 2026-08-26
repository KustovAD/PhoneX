import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const LINKS = [
  ["/account", "profile"],
  ["/account/orders", "orders"],
  ["/account/favorites", "favorites"],
  ["/account/listings", "listings"],
  ["/account/bonuses", "bonuses"],
] as const;

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const t = await getTranslations("account");

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[220px_1fr] md:px-6">
      <aside className="space-y-2">
        <h1 className="mb-4 font-heading text-2xl">{t("title")}</h1>
        {LINKS.map(([href, key]) => (
          <Link key={href} href={href} className="block rounded-xl px-3 py-2 text-sm text-mist hover:bg-accent hover:text-foreground">
            {t(key)}
          </Link>
        ))}
        {(session.user.role === "admin" || session.user.role === "moderator") && (
          <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm text-primary">
            {t("admin")}
          </Link>
        )}
      </aside>
      <div>{children}</div>
    </div>
  );
}
