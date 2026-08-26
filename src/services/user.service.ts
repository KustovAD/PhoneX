import bcrypt from "bcryptjs";
import { prisma } from "@/db/prisma";
import { bonusService } from "@/services/bonus.service";
import { registerSchema, profileSchema } from "@/lib/validations";
import { nanoid } from "nanoid";
import type { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema>;
type ProfileInput = z.infer<typeof profileSchema>;

export class UserService {
  async register(input: RegisterInput) {
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: input.phone }] },
    });
    if (existing) {
      throw new Error("USER_EXISTS");
    }

    const userRole = await prisma.role.findUnique({ where: { name: "user" } });
    if (!userRole) throw new Error("ROLE_MISSING");

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        phone: input.phone,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        roleId: userRole.id,
        referralCode: nanoid(8).toUpperCase(),
        profile: { create: {} },
        bonusAccount: { create: { balance: 0 } },
      },
    });

    const token = nanoid(32);
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        type: "email",
      },
    });

    await bonusService.onRegistration(user.id);
    return { user, verifyToken: token };
  }

  async verifyEmail(token: string) {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.expires < new Date() || record.type !== "email") {
      throw new Error("INVALID_TOKEN");
    }
    await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    });
    await prisma.verificationToken.delete({ where: { token } });
  }

  async requestPasswordReset(identifier: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { phone: identifier }],
      },
    });
    if (!user) return null;
    const token = nanoid(32);
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 30),
        type: "reset",
      },
    });
    return { email: user.email, token };
  }

  async resetPassword(token: string, password: string) {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.expires < new Date() || record.type !== "reset") {
      throw new Error("INVALID_TOKEN");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: record.identifier },
      data: { passwordHash },
    });
    await prisma.verificationToken.delete({ where: { token } });
  }

  async updateProfile(userId: string, input: ProfileInput) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        profile: {
          upsert: {
            create: { city: input.city, bio: input.bio },
            update: { city: input.city, bio: input.bio },
          },
        },
      },
    });
  }

  async setBlocked(userId: string, isBlocked: boolean, adminId: string) {
    await prisma.user.update({ where: { id: userId }, data: { isBlocked } });
    await prisma.adminAction.create({
      data: {
        adminId,
        action: isBlocked ? "user.block" : "user.unblock",
        entityType: "user",
        entityId: userId,
      },
    });
  }

  async setRole(userId: string, roleName: string, adminId: string) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error("ROLE_MISSING");
    await prisma.user.update({ where: { id: userId }, data: { roleId: role.id } });
    await prisma.adminAction.create({
      data: {
        adminId,
        action: "user.role",
        entityType: "user",
        entityId: userId,
        payload: roleName,
      },
    });
  }
}

export const userService = new UserService();
