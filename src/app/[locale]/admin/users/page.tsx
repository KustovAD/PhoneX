"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isBlocked: boolean;
  role: { name: string };
  bonusAccount?: { balance: number } | null;
};

export default function AdminUsers() {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((j) => setUsers(j.data ?? []));
  }, []);

  async function patch(userId: string, action: string, role?: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, role }),
    });
    if (res.ok) toast.success(t("updated"));
  }

  return (
    <div className="overflow-auto">
      <h1 className="mb-6 font-heading text-3xl">{t("users")}</h1>
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="p-2">{t("name")}</th>
            <th className="p-2">{t("email")}</th>
            <th className="p-2">{t("role")}</th>
            <th className="p-2">{t("bonuses")}</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border/60">
              <td className="p-2">
                {u.firstName} {u.lastName}
              </td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role.name}</td>
              <td className="p-2">{u.bonusAccount?.balance ?? 0}</td>
              <td className="space-x-2 p-2">
                <Button size="sm" variant="outline" onClick={() => patch(u.id, u.isBlocked ? "unblock" : "block")}>
                  {u.isBlocked ? t("unblock") : t("block")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => patch(u.id, "role", "moderator")}>
                  {t("moderator")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
