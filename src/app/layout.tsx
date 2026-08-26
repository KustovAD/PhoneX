import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  title: {
    default: "PhoneX — технологии, которые хочется держать в руках",
    template: "%s · PhoneX",
  },
  description: "Премиальный магазин смартфонов и электроники. Честные цены, быстрая доставка и Trade-in.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${unbounded.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
