import { auth } from "@/auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user?.id) {
    const error = new Error("UNAUTHORIZED");
    throw error;
  }
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "moderator") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
