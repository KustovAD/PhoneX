import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/db/prisma";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email или телефон", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.identifier.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { phone: parsed.data.identifier.trim() }],
          },
          include: { role: true },
        });

        if (!user || user.isBlocked) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image,
          role: user.role.name,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
});
