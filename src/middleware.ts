import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

const staffRoles = new Set(["admin", "moderator"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const localeMatch = pathname.match(/^\/(ru|en)(\/|$)/);
  const locale = localeMatch?.[1] ?? "ru";
  const rest = pathname.replace(/^\/(ru|en)/, "") || "/";

  const isAuthPage = rest.startsWith("/login") || rest.startsWith("/register");
  const isAccount = rest.startsWith("/account") || rest.startsWith("/checkout") || rest.startsWith("/sell");
  const isAdmin = rest.startsWith("/admin");

  if ((isAccount || isAdmin) && !req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && req.auth && !staffRoles.has(req.auth.user.role)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  if (isAuthPage && req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/account`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|uploads|.*\\..*).*)"],
};
