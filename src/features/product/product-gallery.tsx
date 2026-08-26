"use client";

import { useState } from "react";
import { ProductPhoto } from "@/components/product-photo";

export function ProductGallery({
  images,
  alt,
}: {
  images: { url: string }[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index]?.url;

  return (
    <div>
      <ProductPhoto
        src={current}
        alt={alt}
        className="h-[420px] rounded-[2rem] border border-border/70 md:h-[560px]"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, i) => (
            <button
              key={image.url + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`overflow-hidden rounded-2xl border ${index === i ? "border-primary" : "border-border/70"}`}
            >
              <ProductPhoto src={image.url} alt={alt} className="h-24" sizes="120px" fit="cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
