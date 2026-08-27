import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/db/prisma";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ProductPhoto } from "@/components/product-photo";

export const dynamic = "force-dynamic";

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

  const heroPhotos = products
    .map((product) => ({
      src: product.images[0]?.url,
      alt: locale === "en" ? product.nameEn : product.nameRu,
      slug: product.slug,
    }))
    .filter((item) => item.src?.startsWith("/uploads/"))
    .slice(0, 2);

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
        <div className="relative min-h-[320px] md:min-h-[480px]">
          {heroPhotos.length > 0 ? (
            <div className="relative h-[380px] md:h-[500px]">
              {heroPhotos.map((photo, index) => (
                <Link
                  key={photo.slug}
                  href={`/products/${photo.slug}`}
                  className={`absolute w-[58%] overflow-hidden rounded-[2rem] border border-border/70 shadow-[0_24px_60px_rgba(43,36,28,0.12)] ${
                    index === 0 ? "left-[4%] top-4 rotate-[-6deg]" : "right-[2%] top-20 rotate-[8deg]"
                  }`}
                >
                  <ProductPhoto src={photo.src} alt={photo.alt} className="h-[300px] md:h-[380px]" sizes="40vw" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex h-[380px] items-center justify-center rounded-[2.5rem] border border-beige/40 bg-card/80 md:h-[480px]">
              <p className="font-heading text-5xl tracking-tight text-beige">
                Phone<span className="text-primary">X</span>
              </p>
            </div>
          )}
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
