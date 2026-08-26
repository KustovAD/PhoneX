"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ProductPhoto } from "@/components/product-photo";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, setQty, remove } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!items.length) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title={t("empty")} /></div>;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_280px] md:px-6">
      <div className="space-y-4">
        <h1 className="font-heading text-3xl">{t("title")}</h1>
        {items.map((item) => (
          <article key={item.productId} className="flex gap-4 rounded-2xl border border-border/70 p-4">
            <ProductPhoto
              src={item.imageUrl}
              alt={item.title}
              className="h-24 w-20 shrink-0 rounded-xl"
              sizes="80px"
              fit="cover"
            />
            <div className="flex-1">
              <p className="font-heading">{item.title}</p>
              <p className="text-sm text-mist">{formatPrice(item.price, "ru")}</p>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => setQty(item.productId, item.quantity - 1)} className="size-7 rounded border">
                  −
                </button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => setQty(item.productId, item.quantity + 1)} className="size-7 rounded border">
                  +
                </button>
                <button type="button" onClick={() => remove(item.productId)} className="ml-4 text-sm text-muted-foreground">
                  {t("remove")}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="h-fit rounded-3xl border border-border/70 bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">{t("subtotal")}</p>
        <p className="mt-2 font-heading text-3xl">{formatPrice(subtotal, "ru")}</p>
        <Button asChild className="mt-6 h-11 w-full">
          <Link href="/checkout">{t("checkout")}</Link>
        </Button>
      </aside>
    </div>
  );
}
