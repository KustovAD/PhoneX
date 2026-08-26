"use client";

import { useTranslations } from "next-intl";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";

export function ProductActions({
  product,
  title,
}: {
  product: {
    id: string;
    slug: string;
    price: number;
    stock: number;
    colorHex: string;
    brand: { name: string };
    images?: { url: string }[];
  };
  title: string;
}) {
  const t = useTranslations("product");
  const router = useRouter();
  const add = useCart((s) => s.add);
  const toggle = useFavorites((s) => s.toggle);
  const liked = useFavorites((s) => s.ids.includes(product.id));

  const payload = {
    productId: product.id,
    slug: product.slug,
    title,
    brand: product.brand.name,
    price: product.price,
    colorHex: product.colorHex,
    imageUrl: product.images?.[0]?.url,
  };

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Button
        className="h-12 flex-1"
        disabled={product.stock < 1}
        onClick={() => {
          add(payload);
          toast.success(t("addToCart"));
        }}
      >
        <ShoppingBag className="size-4" />
        {t("addToCart")}
      </Button>
      <Button
        variant="outline"
        className="h-12 flex-1"
        disabled={product.stock < 1}
        onClick={() => {
          add(payload);
          router.push("/checkout");
        }}
      >
        {t("buyNow")}
      </Button>
      <Button variant="ghost" className="h-12" onClick={() => toggle(product.id)}>
        <Heart className={liked ? "fill-beige text-beige" : ""} />
        {t("favorite")}
      </Button>
    </div>
  );
}
