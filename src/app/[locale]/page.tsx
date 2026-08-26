import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/db/prisma";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { PhoneVisual } from "@/components/phone-visual";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero");
  const h = await getTranslations("home");

  const [brands, products] = await Promise.all([
    prisma.brand.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: { brand: true, images: true },
      take: 8,
      orderBy: { viewCount: "desc" },
    }),
  ]);

  return (
    <div>
      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-8 pt-10 md:grid-cols-2 md:px-6 md:pt-16">
        <div className="animate-rise">
          <p className="text-xs uppercase tracking-[0.28em] text-beige">PhoneX · 2026</p>
          <h1 className="mt-4 max-w-xl font-heading text-4xl leading-[1.05] md:text-6xl">{t("title")}</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-mist md:text-lg">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-12 px-6 text-base">
              <Link href="/catalog">{t("catalog")}</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-6 text-base">
              <Link href="/trade-in">{t("tradeIn")}</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-[420px] md:h-[540px]">
          <div className="absolute left-[8%] top-8 w-[46%] rotate-[-8deg]">
            <PhoneVisual color="#C4B7A6" brand="Apple" model="iPhone 15 Pro" className="h-[380px] md:h-[460px]" />
          </div>
          <div className="absolute right-[6%] top-16 w-[46%] rotate-[10deg]">
            <PhoneVisual color="#1E3A5F" brand="Samsung" model="Galaxy S24" className="h-[380px] md:h-[460px]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h2 className="font-heading text-3xl">{h("categories")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalog?brand=${brand.slug}`}
              className="rounded-2xl border border-border/70 bg-card/70 px-4 py-6 text-center transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <p className="font-heading text-lg">{brand.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-3xl">{h("popular")}</h2>
          <Link href="/catalog" className="text-sm text-primary">
            {h("more")}
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} locale={locale} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-3 md:px-6">
        {[
          ["honest", "honestText"],
          ["fast", "fastText"],
          ["trade", "tradeText"],
        ].map(([title, text]) => (
          <div key={title} className="rounded-3xl border border-border/70 bg-card/60 p-6">
            <h3 className="font-heading text-xl">{h(title)}</h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">{h(text)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
