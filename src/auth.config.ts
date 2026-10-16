import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  // Vercel: accept either AUTH_SECRET (Auth.js v5) or the legacy NEXTAUTH_SECRET.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "user");
        session.user.firstName = String(token.firstName ?? "");
        session.user.lastName = String(token.lastName ?? "");
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
