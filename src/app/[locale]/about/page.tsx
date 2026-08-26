import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="text-xs uppercase tracking-[0.28em] text-beige">PhoneX</p>
      <h1 className="mt-3 font-heading text-4xl">{t("title")}</h1>
      <p className="mt-6 text-lg leading-relaxed text-mist">{t("text")}</p>
    </div>
  );
}
