"use client";

import { useState } from "react";
import { PhoneVisual } from "@/components/phone-visual";

export function ProductGallery({
  color,
  brand,
  model,
}: {
  color: string;
  brand: string;
  model: string;
}) {
  const [angle, setAngle] = useState<"front" | "back" | "side">("front");

  return (
    <div>
      <div className="relative h-[420px] overflow-hidden rounded-[2rem] border border-border/70 bg-card/50 md:h-[560px]">
        <PhoneVisual color={color} brand={brand} model={model} angle={angle} className="h-full" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {(["front", "back", "side"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setAngle(item)}
            className={`h-24 overflow-hidden rounded-2xl border ${angle === item ? "border-primary" : "border-border/70"} bg-card/60`}
          >
            <PhoneVisual color={color} brand={brand} model={model} angle={item} className="h-full scale-125" />
          </button>
        ))}
      </div>
    </div>
  );
}
