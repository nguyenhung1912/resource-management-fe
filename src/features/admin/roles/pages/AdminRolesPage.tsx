import { useState, type FormEvent } from 'react';

import { Save, Search, ShieldCheck } from 'lucide-react';

import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertBanner } from '@/components/common/AlertBanner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

import type { AdminUser, PaginatedResponse, Role } from '@/features/admin/accounts/types/admin-account.types';

import { adminRoleService } from '@/services/adminRoleService';

interface LoaderData {
  users: PaginatedResponse<AdminUser>;
  roles: Role[];
}

export function AdminRolesPage() {
  const { users, roles } = useLoaderData() as LoaderData;

  const revalidator = useRevalidator();

  const [searchParams, setSearchParams] = useSearchParams();

  const [pendingRoles, setPendingRoles] = useState<Record<string, number>>({});

  const [savingUid, setSavingUid] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateQuery = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    next.set('pageNumber', '1');

    setSearchParams(next);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const search = String(formData.get('search') ?? '').trim();

    updateQuery('search', search || undefined);
  };

  /**
   * Lấy roleId hiện tại của user
   * từ roleName mà API trả về.
   */
  const getCurrentRoleId = (user: AdminUser) => {
    return roles.find((role) => role.roleName === user.role)?.roleId;
  };

  const handleRoleChange = (uid: string, value: string) => {
    setPendingRoles((current) => {
      const next = {
        ...current,
      };

      if (!value) {
        delete next[uid];

        return next;
      }

      next[uid] = Number(value);

      return next;
    });
  };

  const handleSave = async (user: AdminUser) => {
    const currentRoleId = getCurrentRoleId(user);

    const roleId = pendingRoles[user.uid] ?? currentRoleId;

    if (!roleId) {
      setError('Không xác định được Role.');

      return;
    }

    if (currentRoleId === roleId) {
      return;
    }

    const role = roles.find((item) => item.roleId === roleId);

    if (!role) {
      setError('Role không tồn tại.');

      return;
    }

    const confirmed = window.confirm(`Đổi Role của "${user.fullName}" thành "${role.roleName}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setSavingUid(user.uid);

      setError(null);

      setSuccessMessage(null);

      await adminRoleService.updateUserRole(user.uid, roleId);

      setSuccessMessage(`Cập nhật Role của ${user.fullName} thành ${role.roleName} thành công.`);

      /**
       * Xóa thay đổi tạm sau khi lưu.
       */
      setPendingRoles((current) => {
        const next = {
          ...current,
        };

        delete next[user.uid];

        return next;
      });

      /**
       * Reload dữ liệu từ loader
       * để role hiện tại cập nhật.
       */
      revalidator.revalidate();
    } catch (err) {
      console.error(err);

      setError('Không thể cập nhật Role.');
    } finally {
      setSavingUid(null);
    }
  };

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams);

    next.set('pageNumber', String(page));

    setSearchParams(next);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-primary" />

          <h1 className="text-2xl font-bold text-text-main">Quản lý Role</h1>
        </div>

        <p className="mt-1 text-sm text-text-muted">Phân công vai trò Admin, Lecturer hoặc Student cho người dùng.</p>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError(null)} />}

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Phân công Role</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* SEARCH + FILTER */}
          <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                name="search"
                defaultValue={searchParams.get('search') ?? ''}
                iconLeft={<Search className="size-4" />}
                placeholder="Tìm mã, họ tên hoặc email..."
              />

              <Button type="submit" variant="secondary">
                Tìm
              </Button>
            </form>

            <Select
              value={searchParams.get('roleId') ?? ''}
              onChange={(event) => updateQuery('roleId', event.target.value)}
            >
              <option value="">Tất cả Role</option>

              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </Select>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-xl border border-border-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>

                  <TableHead>Role hiện tại</TableHead>

                  <TableHead>Role mới</TableHead>

                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.items.map((user) => {
                  const currentRoleId = getCurrentRoleId(user);

                  /**
                   * Nếu chưa chỉnh thì
                   * hiển thị Role hiện tại.
                   */
                  const selectedRoleId = pendingRoles[user.uid] ?? currentRoleId;

                  const changed = currentRoleId !== selectedRoleId;

                  return (
                    <TableRow key={user.uid}>
                      {/* USER */}
                      <TableCell>
                        <div>
                          <p className="font-semibold text-text-main">{user.fullName}</p>

                          <p className="text-xs text-text-muted">
                            {user.userCode}

                            {' · '}

                            {user.email}
                          </p>
                        </div>
                      </TableCell>

                      {/* CURRENT ROLE */}
                      <TableCell>
                        <Badge variant="primary">{user.role ?? 'Chưa có'}</Badge>
                      </TableCell>

                      {/* NEW ROLE */}
                      <TableCell>
                        <div className="w-48">
                          <Select
                            value={selectedRoleId ? String(selectedRoleId) : ''}
                            disabled={savingUid === user.uid}
                            onChange={(event) => handleRoleChange(user.uid, event.target.value)}
                          >
                            <option value="">Chọn Role</option>

                            {roles.map((role) => (
                              <option key={role.roleId} value={role.roleId}>
                                {role.roleName}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </TableCell>

                      {/* ACTION */}
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            disabled={!changed}
                            isLoading={savingUid === user.uid}
                            iconLeft={<Save className="size-4" />}
                            onClick={() => {
                              void handleSave(user);
                            }}
                          >
                            Lưu
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {users.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-text-muted">
                      Không tìm thấy người dùng.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={users.pageNumber <= 1}
              onClick={() => goToPage(users.pageNumber - 1)}
            >
              Trước
            </Button>

            <span className="flex items-center px-2 text-sm text-text-muted">
              {users.pageNumber}

              {' / '}

              {Math.max(users.totalPages, 1)}
            </span>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={users.pageNumber >= users.totalPages}
              onClick={() => goToPage(users.pageNumber + 1)}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminRolesPage;
