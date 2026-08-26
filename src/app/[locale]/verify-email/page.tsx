import { getTranslations } from "next-intl/server";
import { userService } from "@/services/user.service";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const t = await getTranslations("auth");
  const { token } = await searchParams;
  let ok = false;
  if (token) {
    try {
      await userService.verifyEmail(token);
      ok = true;
    } catch {
      ok = false;
    }
  }
  return (
    <p className="px-4 py-24 text-center font-heading text-2xl">
      {ok ? t("verifyOk") : t("verifyBad")}
    </p>
  );
}
