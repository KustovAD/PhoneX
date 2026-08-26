import { getTranslations, setRequestLocale } from "next-intl/server";

const ITEMS = [
  { key: "leatherCase" as const, price: 6900 },
  { key: "magsafe" as const, price: 4500 },
  { key: "cable" as const, price: 1900 },
  { key: "glass" as const, price: 1500 },
];

export default async function AccessoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("accessories");
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl">{t("title")}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <article key={item.key} className="rounded-3xl border border-border/70 bg-card/60 p-6">
            <h2 className="font-heading text-xl">{t(item.key)}</h2>
            <p className="mt-2 text-mist">{item.price.toLocaleString("ru-RU")} ₽</p>
          </article>
        ))}
      </div>
    </div>
  );
}
