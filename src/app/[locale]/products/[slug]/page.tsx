import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { productService } from "@/services/product.service";
import { formatPrice, maskImei } from "@/lib/format";
import { Stars } from "@/components/stars";
import { ProductActions } from "@/features/product/product-actions";
import { ProductGallery } from "@/features/product/product-gallery";
import { ReviewForm } from "@/features/product/review-form";
import { Badge } from "@/components/ui/badge";

const CHECKS = [
  "screen",
  "cameras",
  "biometrics",
  "speakers",
  "mic",
  "charging",
  "wifi",
  "bluetooth",
  "buttons",
  "batteryCheck",
  "body",
] as const;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await productService.bySlug(slug);
  if (!product) notFound();
  const t = await getTranslations("product");
  const tk = await getTranslations("kit");
  const tc = await getTranslations("catalog");
  const title = locale === "en" ? product.nameEn : product.nameRu;
  const kit = JSON.parse(product.kitJson || "[]") as string[];
  const inspection = JSON.parse(product.inspectionJson || "{}") as Record<string, string>;

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-2 md:px-6">
      <ProductGallery images={product.images} alt={title} />
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-beige">{product.brand.name}</p>
        <h1 className="mt-2 font-heading text-4xl">{title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-mist">
          <Stars value={product.ratingAvg} />
          <span>{product.ratingCount}</span>
          <Badge variant="secondary">
            {product.stock > 3 ? t("inStock") : product.stock > 0 ? t("limited") : t("outOfStock")}
          </Badge>
        </div>
        <div className="mt-6 flex items-end gap-3">
          <p className="text-4xl">{formatPrice(product.price, locale)}</p>
          {product.oldPrice ? (
            <p className="text-muted-foreground line-through">{formatPrice(product.oldPrice, locale)}</p>
          ) : null}
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">{t("storage")}</dt>
            <dd>{product.storageGb === 1024 ? tc("tb") : tc("gb", { n: product.storageGb })}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("color")}</dt>
            <dd>{locale === "en" ? product.colorEn : product.colorRu}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("condition")}</dt>
            <dd>{t(product.condition as "new")}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("battery")}</dt>
            <dd>{product.batteryHealth}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("warranty")}</dt>
            <dd>
              {product.warrantyMonths} {t("months")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("imei")}</dt>
            <dd>{maskImei(product.imei)}</dd>
          </div>
        </dl>
        <ProductActions product={product} title={title} />

        <div className="mt-10 rounded-3xl border border-border/70 bg-card/50 p-5">
          <h2 className="font-heading text-xl">{t("seller")}</h2>
          <p className="mt-2">
            {product.seller
              ? `${product.seller.firstName} ${product.seller.lastName}`
              : t("store")}
          </p>
          <p className="text-sm text-beige">
            ★ {(product.seller?.profile?.ratingAvg ?? 4.9).toFixed(1)} ·{" "}
            {product.seller?.profile?.dealsCount ?? 127} {t("deals")}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="font-heading text-xl">{t("kit")}</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {kit.map((item) => (
              <li key={item} className="rounded-full border border-border px-3 py-1 text-mist">
                {tk.has(item) ? tk(item) : item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="font-heading text-xl">{t("inspection")}</h2>
          <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/70">
            {CHECKS.map((key) => {
              const map: Record<string, string> = {
                screen: "screen",
                cameras: "cameras",
                biometrics: "biometrics",
                speakers: "speakers",
                mic: "mic",
                charging: "charging",
                wifi: "wifi",
                bluetooth: "bluetooth",
                buttons: "buttons",
                batteryCheck: "battery",
                body: "body",
              };
              const status = inspection[map[key]] ?? "pass";
              return (
                <li key={key} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{t(key)}</span>
                  <span className={status === "pass" ? "text-success" : "text-destructive"}>
                    {status === "pass" ? t("pass") : t("fail")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="font-heading text-xl">{t("reviews")}</h2>
          <div className="mt-4 space-y-4">
            {product.reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-border/70 p-4">
                <Stars value={review.rating} />
                <p className="mt-2 text-sm text-mist">{review.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{review.author.firstName}</p>
              </article>
            ))}
          </div>
          <ReviewForm productId={product.id} />
        </div>
      </div>
    </div>
  );
}
