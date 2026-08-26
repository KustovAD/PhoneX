"use client";

import { useTranslations } from "next-intl";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ProductPhoto } from "@/components/product-photo";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  model: string;
  storageGb: number;
  condition: string;
  colorRu: string;
  colorEn: string;
  colorHex: string;
  price: number;
  oldPrice?: number | null;
  ratingAvg: number;
  stock: number;
  brand: { name: string; slug: string };
  images?: { url: string }[];
};

export function ProductCard({
  product,
  locale,
}: {
  product: ProductCardData;
  locale: string;
}) {
  const t = useTranslations("product");
  const tc = useTranslations("catalog");
  const add = useCart((s) => s.add);
  const toggle = useFavorites((s) => s.toggle);
  const liked = useFavorites((s) => s.ids.includes(product.id));
  const title = locale === "en" ? product.nameEn : product.nameRu;
  const color = locale === "en" ? product.colorEn : product.colorRu;
  const photo = product.images?.[0]?.url;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-4 shadow-[0_10px_40px_rgba(43,36,28,0.08)] transition duration-300 hover:-translate-y-1 hover:border-primary/40">
      <button
        type="button"
        onClick={() => toggle(product.id)}
        className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/70 backdrop-blur"
        aria-label={t("favorite")}
      >
        <Heart className={cn("size-4", liked && "fill-beige text-beige")} />
      </button>
      <Link href={`/products/${product.slug}`} className="block">
        <ProductPhoto
          src={photo}
          alt={title}
          className="h-56 rounded-2xl"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {product.brand.name}
        </p>
        <h3 className="mt-1 font-heading text-lg leading-tight">{title}</h3>
        <p className="mt-2 text-sm text-mist">
          {product.storageGb === 1024 ? tc("tb") : tc("gb", { n: product.storageGb })} · {t(product.condition as "new")} · {color}
        </p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-xl font-medium">{formatPrice(product.price, locale)}</span>
          {product.oldPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.oldPrice, locale)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-beige">★ {product.ratingAvg.toFixed(1)}</p>
      </Link>
      <div className="mt-4 flex gap-2">
        <Button
          className="h-10 flex-1"
          onClick={() => {
            add({
              productId: product.id,
              slug: product.slug,
              title,
              brand: product.brand.name,
              price: product.price,
              colorHex: product.colorHex,
              imageUrl: photo,
            });
            toast.success(t("addToCart"));
          }}
          disabled={product.stock < 1}
        >
          <ShoppingBag className="size-4" />
          {t("addToCart")}
        </Button>
        <Button variant="outline" className="h-10" asChild>
          <Link href={`/products/${product.slug}`}>{t("details")}</Link>
        </Button>
      </div>
    </article>
  );
}
