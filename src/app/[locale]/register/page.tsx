import { setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/features/auth/register-form";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return (
    <div className="px-4 py-16">
      <RegisterForm />
    </div>
  );
}
