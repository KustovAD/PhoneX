import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";

const LINKS = [
  ["/admin", "dashboard"],
  ["/admin/users", "users"],
  ["/admin/products", "products"],
  ["/admin/listings", "listings"],
  ["/admin/trade-in", "tradeIn"],
  ["/admin/bonuses", "bonuses"],
] as const;

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "moderator")) {
    redirect(`/${locale}`);
  }
  const t = await getTranslations("admin");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <nav className="mb-8 flex flex-wrap gap-4 text-sm text-mist">
        {LINKS.map(([href, key]) => (
          <Link key={href} href={href}>
            {t(key)}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
