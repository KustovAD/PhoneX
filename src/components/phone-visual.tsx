export function PhoneVisual({
  color = "#1C1C1E",
  brand = "PhoneX",
  model = "",
  angle = "front",
  className = "",
}: {
  color?: string;
  brand?: string;
  model?: string;
  angle?: "front" | "back" | "side";
  className?: string;
}) {
  const rotate =
    angle === "side" ? "rotateY(-28deg) rotateX(6deg)" : angle === "back" ? "rotateY(180deg)" : "rotateY(-12deg) rotateX(8deg)";

  return (
    <div className={`relative isolate flex items-center justify-center ${className}`}>
      <div
        className="absolute inset-8 rounded-full blur-3xl opacity-40"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />
      <div
        className="relative aspect-[9/19] w-[46%] max-w-[220px] transition-transform duration-700"
        style={{ transform: rotate, transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-0 rounded-[2.1rem] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          style={{
            background: `linear-gradient(160deg, ${color} 0%, #0a0a0a 100%)`,
            boxShadow: `inset 0 0 0 2px color-mix(in srgb, white 18%, transparent), 0 24px 60px rgba(0,0,0,0.4)`,
          }}
        >
          <div className="absolute inset-[7px] overflow-hidden rounded-[1.7rem] bg-[#07141a]">
            {angle !== "back" ? (
              <>
                <div className="absolute left-1/2 top-2.5 h-4 w-20 -translate-x-1/2 rounded-full bg-black/80" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40" />
                <div className="absolute inset-x-0 bottom-10 text-center">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">{brand}</p>
                  <p className="mt-1 text-xs text-white/80">{model}</p>
                </div>
              </>
            ) : (
              <>
                <div className="absolute left-1/2 top-8 size-16 -translate-x-1/2 rounded-full border border-white/15 bg-black/40" />
                <div className="absolute left-1/2 top-[4.6rem] size-5 -translate-x-1/2 rounded-full bg-black/70" />
                <div className="absolute inset-x-0 bottom-12 text-center text-[10px] uppercase tracking-[0.3em] text-white/35">
                  {brand}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
