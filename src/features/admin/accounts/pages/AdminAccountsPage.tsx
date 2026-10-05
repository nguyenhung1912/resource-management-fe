import type { FormEvent } from 'react';
import { useState } from 'react';

import { Edit, Lock, Search, Trash2, Unlock, UserPlus, Users } from 'lucide-react';

import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '@/features/admin/accounts/components/EditUserModal';
import { AlertBanner } from '@/components/common/AlertBanner';

import type { AdminUser, PaginatedResponse, Role } from '@/features/admin/accounts/types/admin-account.types';

import { adminAccountService } from '@/services/adminAccountService';

interface LoaderData {
  users: PaginatedResponse<AdminUser>;
  roles: Role[];
}

export function AdminAccountsPage() {
  const { users, roles } = useLoaderData() as LoaderData;

  const revalidator = useRevalidator();

  const [searchParams, setSearchParams] = useSearchParams();

  const [processingUid, setProcessingUid] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // =====================================================
  // UPDATE QUERY PARAMS
  // =====================================================
  const updateQuery = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);

    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    next.set('pageNumber', '1');

    setSearchParams(next);
  };

  // =====================================================
  // SEARCH
  // =====================================================
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const search = String(formData.get('search') ?? '').trim();

    updateQuery('search', search || undefined);
  };

  // =====================================================
  // LOCK / UNLOCK
  // =====================================================
  const handleStatusChange = async (user: AdminUser) => {
    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Bạn có chắc muốn mở khóa tài khoản "${user.userCode}"?`
        : `Bạn có chắc muốn khóa tài khoản "${user.userCode}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingUid(user.uid);

      setActionError(null);
      setSuccessMessage(null);

      await adminAccountService.updateStatus(user.uid, nextStatus);

      setSuccessMessage(nextStatus ? 'Mở khóa tài khoản thành công.' : 'Khóa tài khoản thành công.');

      revalidator.revalidate();
    } catch (error) {
      console.error(error);

      setActionError(nextStatus ? 'Không thể mở khóa tài khoản.' : 'Không thể khóa tài khoản.');
    } finally {
      setProcessingUid(null);
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================
  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tài khoản "${user.fullName}" (${user.userCode})?\n\nHành động này không thể hoàn tác.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUid(user.uid);

      setActionError(null);
      setSuccessMessage(null);

      await adminAccountService.deleteUser(user.uid);

      setSuccessMessage('Xóa tài khoản thành công.');
      revalidator.revalidate();
    } catch (error) {
      console.error(error);

      setActionError('Không thể xóa tài khoản. Người dùng có thể đang có dữ liệu liên quan.');
    } finally {
      setDeletingUid(null);
    }
  };

  // =====================================================
  // PAGINATION
  // =====================================================
  const goToPage = (page: number) => {
    if (page < 1 || page > Math.max(users.totalPages, 1)) {
      return;
    }

    const next = new URLSearchParams(searchParams);

    next.set('pageNumber', String(page));

    setSearchParams(next);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-6 text-primary" />

            <h1 className="text-2xl font-bold text-text-main">Quản lý tài khoản</h1>
          </div>

          <p className="mt-1 text-sm text-text-muted">Quản lý thông tin, trạng thái và tài khoản người dùng.</p>
        </div>

        <Button type="button" iconLeft={<UserPlus className="size-4" />} onClick={() => setShowCreateModal(true)}>
          Tạo tài khoản
        </Button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}
      {actionError && <AlertBanner type="danger" message={actionError} onClose={() => setActionError(null)} />}

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      {/* =====================================================
          CARD
      ===================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* =================================================
              FILTER
          ================================================= */}
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
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

            {/* FILTER ROLE */}
            <Select
              value={searchParams.get('roleId') ?? ''}
              onChange={(event) => updateQuery('roleId', event.target.value)}
            >
              <option value="">Tất cả vai trò</option>

              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </Select>

            {/* FILTER STATUS */}
            <Select
              value={searchParams.get('isActive') ?? ''}
              onChange={(event) => updateQuery('isActive', event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>

              <option value="true">Đang hoạt động</option>

              <option value="false">Đã khóa</option>
            </Select>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              Tổng cộng <strong className="text-text-main">{users.totalCount}</strong> tài khoản
            </span>

            <span className="text-text-muted">
              Trang {users.pageNumber}
              {' / '}
              {Math.max(users.totalPages, 1)}
            </span>
          </div>

          {/* =================================================
              TABLE
          ================================================= */}
          <div className="overflow-hidden rounded-xl border border-border-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>

                  <TableHead>Vai trò</TableHead>

                  <TableHead>Đơn vị</TableHead>

                  <TableHead>Trạng thái</TableHead>

                  <TableHead>Ngày tạo</TableHead>

                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.items.map((user) => {
                  const isProcessing = processingUid === user.uid;

                  const isDeleting = deletingUid === user.uid;

                  return (
                    <TableRow key={user.uid}>
                      {/* USER */}
                      <TableCell>
                        <div className="min-w-48">
                          <p className="font-semibold text-text-main">{user.fullName}</p>

                          <p className="mt-0.5 text-xs text-text-muted">
                            {user.userCode}
                            {' · '}
                            {user.email}
                          </p>
                        </div>
                      </TableCell>

                      {/* ROLE */}
                      <TableCell>
                        <Badge variant="primary">{user.role ?? 'Chưa có'}</Badge>
                      </TableCell>

                      {/* UNIT */}
                      <TableCell>
                        <div className="text-sm">
                          <p>{user.major ?? '—'}</p>

                          {user.subMajor && <p className="text-xs text-text-muted">{user.subMajor}</p>}
                        </div>
                      </TableCell>

                      {/* STATUS */}
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                        </Badge>
                      </TableCell>

                      {/* CREATED DATE */}
                      <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>

                      {/* ACTIONS */}
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          {/* EDIT */}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isProcessing || isDeleting}
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="size-4" />
                            Sửa
                          </Button>

                          {/* LOCK / UNLOCK */}
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            isLoading={isProcessing}
                            disabled={isDeleting}
                            onClick={() => {
                              void handleStatusChange(user);
                            }}
                          >
                            {user.isActive ? (
                              <>
                                <Lock className="size-4" />
                                Khóa
                              </>
                            ) : (
                              <>
                                <Unlock className="size-4" />
                                Mở khóa
                              </>
                            )}
                          </Button>

                          {/* DELETE */}
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            isLoading={isDeleting}
                            disabled={isProcessing}
                            onClick={() => {
                              void handleDelete(user);
                            }}
                          >
                            <Trash2 className="size-4" />
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* EMPTY */}
                {users.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-text-muted">
                      Không tìm thấy tài khoản phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={users.pageNumber <= 1}
              onClick={() => goToPage(users.pageNumber - 1)}
            >
              Trước
            </Button>

            <span className="px-2 text-sm text-text-muted">{users.pageNumber}</span>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={users.pageNumber >= users.totalPages}
              onClick={() => goToPage(users.pageNumber + 1)}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          EDIT USER MODAL
      ===================================================== */}
      <EditUserModal
        user={editingUser}
        onClose={() => {
          setEditingUser(null);
        }}
        onSuccess={() => {
          setSuccessMessage('Cập nhật tài khoản thành công.');

          revalidator.revalidate();
        }}
      />

      {showCreateModal && (
        <CreateUserModal
          roles={roles}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);

            setSuccessMessage('Tạo tài khoản thành công.');

            revalidator.revalidate();
          }}
        />
      )}
    </div>
  );
}

export default AdminAccountsPage;
