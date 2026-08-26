"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({ productId }: { productId: string }) {
  const t = useTranslations("product");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, rating, text }),
        });
        setLoading(false);
        if (!res.ok) {
          toast.error(t("reviewNeedPurchase"));
          return;
        }
        toast.success(t("reviewOk"));
        setText("");
      }}
    >
      <p className="text-sm">{t("writeReview")}</p>
      <div className="flex gap-1 text-xl text-beige">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            {n <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} minLength={10} required />
      <Button type="submit" disabled={loading} className="h-10">
        {t("writeReview")}
      </Button>
    </form>
  );
}
