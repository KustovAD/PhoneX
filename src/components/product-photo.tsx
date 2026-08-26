"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductPhoto({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  fit = "contain",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "contain" | "cover";
}) {
  const [failed, setFailed] = useState(false);
  const safeSrc =
    src && (src.startsWith("/uploads/") || src.startsWith("https://") || src.startsWith("http://"))
      ? src
      : null;
  const showImage = Boolean(safeSrc) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-secondary/70", className)}>
      {showImage ? (
        <Image
          src={safeSrc as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={fit === "cover" ? "object-cover" : "object-contain p-3"}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-beige" aria-hidden>
          <Camera className="size-8 opacity-70" />
        </div>
      )}
    </div>
  );
}
