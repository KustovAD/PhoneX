import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="px-4 py-24 text-center">
      <h1 className="font-heading text-4xl">404</h1>
      <p className="mt-3 text-mist">{t("notFound")}</p>
    </div>
  );
}
