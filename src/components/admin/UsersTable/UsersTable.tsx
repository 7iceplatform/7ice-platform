"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Badge } from "@/components/ui/badge";

interface UserRole {
  id: string;
  code: string;
  name: string;
}

interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  isActive: boolean;
  createdAt: string;
  roles: UserRole[];
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UsersResponse {
  data: User[];
  pagination: Pagination;
}

interface AvailableRole {
  code: string;
  name: string;
  description: string;
}

const AVAILABLE_ROLES: AvailableRole[] = [
  { code: "administrator", name: "Administrator", description: "Полный доступ" },
  { code: "manager", name: "Менеджер", description: "CRM и заказы" },
  { code: "technician", name: "Техник", description: "Монтаж и сервис" },
  { code: "viewer", name: "Наблюдатель", description: "Только чтение" },
];

export function UsersTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["admin", "users", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);

      const response = await fetch(`/api/v1/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, roleId, action }: { userId: string; roleId: string; action: "assign" | "revoke" }) => {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, action }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="user-search" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Поиск
          </label>
          <TextInput
            id="user-search"
            placeholder="Email или имя..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th className="px-4 py-3">Пользователь</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Роли</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">
                  Загрузка...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">
                  Пользователи не найдены
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="bg-brand-white">
                  <td className="px-4 py-3 font-medium text-brand-graphite">
                    {user.displayName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-brand-graphite/70">
                    {user.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge key={role.id} tone="info">
                            {role.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-brand-graphite/40">Нет ролей</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={user.isActive ? "info" : "default"}>
                      {user.isActive ? "Активен" : "Заблокирован"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {AVAILABLE_ROLES.filter(
                        (r) => !user.roles.some((ur) => ur.code === r.code),
                      )
                        .slice(0, 1)
                        .map((role) => (
                          <Button
                            key={role.code}
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              roleMutation.mutate({
                                userId: user.id,
                                roleId: role.code === "administrator" ? "administrator" : role.code,
                                action: "assign",
                              })
                            }
                          >
                            + {role.name}
                          </Button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-brand-graphite/60">
          <span>
            Стр. {pagination.page} из {pagination.totalPages} ({pagination.total} всего)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Далее
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
