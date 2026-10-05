import { useState } from 'react';

import { Save, ShieldCheck } from 'lucide-react';

import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { AlertBanner } from '@/components/common/AlertBanner';

import type { Role } from '@/features/admin/accounts/types/admin-account.types';

import type { RoleWithFunctions, SystemFunction } from '@/features/admin/permissions/types/admin-permission.types';

import { adminPermissionService } from '@/services/adminPermissionService';

interface LoaderData {
  roles: Role[];
  functions: SystemFunction[];
  role: RoleWithFunctions | null;
  selectedRoleId?: number;
}

interface PermissionDraft {
  roleId: number;
  functionIds: Set<string>;
}

export function AdminPermissionsPage() {
  const { roles, functions, role, selectedRoleId } = useLoaderData() as LoaderData;

  const revalidator = useRevalidator();

  const [searchParams, setSearchParams] = useSearchParams();

  const [permissionDraft, setPermissionDraft] = useState<PermissionDraft | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const savedFunctionIds = new Set(role?.functions.map((item) => item.functionId) ?? []);

  let checkedIds = savedFunctionIds;

  if (permissionDraft !== null && permissionDraft.roleId === selectedRoleId) {
    checkedIds = permissionDraft.functionIds;
  }

  const hasChanges =
    checkedIds.size !== savedFunctionIds.size ||
    Array.from(checkedIds).some((functionId) => !savedFunctionIds.has(functionId));

  /**
   * Đổi Role đang phân quyền.
   */
  const handleRoleChange = (value: string) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set('roleId', value);
    } else {
      next.delete('roleId');
    }

    /**
     * Bỏ draft của Role trước.
     */
    setPermissionDraft(null);

    setMessage(null);
    setError(null);

    setSearchParams(next);
  };

  /**
   * Chọn / bỏ một Function.
   */
  const toggleFunction = (functionId: string) => {
    if (!selectedRoleId) {
      return;
    }

    const next = new Set(checkedIds);

    if (next.has(functionId)) {
      next.delete(functionId);
    } else {
      next.add(functionId);
    }

    setPermissionDraft({
      roleId: selectedRoleId,
      functionIds: next,
    });

    setMessage(null);
    setError(null);
  };

  /**
   * Chọn tất cả / bỏ chọn tất cả.
   */
  const handleSelectAll = () => {
    if (!selectedRoleId) {
      return;
    }

    const allSelected = functions.length > 0 && checkedIds.size === functions.length;

    const next = allSelected ? new Set<string>() : new Set(functions.map((item) => item.functionId));

    setPermissionDraft({
      roleId: selectedRoleId,
      functionIds: next,
    });

    setMessage(null);
    setError(null);
  };

  /**
   * Lưu toàn bộ Function được chọn
   * cho Role hiện tại.
   */
  const handleSave = async () => {
    if (!selectedRoleId) {
      setError('Vui lòng chọn Role.');

      return;
    }

    try {
      setIsSaving(true);

      setError(null);
      setMessage(null);

      await adminPermissionService.assignFunctions(selectedRoleId, Array.from(checkedIds));

      setMessage('Lưu phân quyền thành công.');

      /**
       * Load lại dữ liệu server.
       *
       * Không reset draft ngay lập tức
       * để tránh checkbox nhảy về dữ liệu cũ
       * trong lúc loader đang revalidate.
       */
      revalidator.revalidate();
    } catch (err) {
      console.error(err);

      setError('Không thể lưu phân quyền.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />

            <h1 className="text-2xl font-bold text-text-main">Phân quyền chức năng</h1>
          </div>

          <p className="mt-1 text-sm text-text-muted">Chọn các chức năng được phép sử dụng cho từng Role.</p>
        </div>

        <Button
          type="button"
          iconLeft={<Save className="size-4" />}
          isLoading={isSaving}
          disabled={!selectedRoleId || !hasChanges}
          onClick={() => {
            void handleSave();
          }}
        >
          Lưu phân quyền
        </Button>
      </div>

      {message && <AlertBanner type="success" message={message} onClose={() => setMessage(null)} />}

      {error && <AlertBanner type="danger" message={error} onClose={() => setError(null)} />}

      {/* ROLE */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn Role</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-w-sm">
            <Select
              value={selectedRoleId ? String(selectedRoleId) : ''}
              onChange={(event) => handleRoleChange(event.target.value)}
            >
              {roles.length === 0 && <option value="">Không có Role</option>}

              {roles.map((item) => (
                <option key={item.roleId} value={item.roleId}>
                  {item.roleName}
                </option>
              ))}
            </Select>
          </div>

          {role && (
            <div className="mt-4">
              <Badge variant="primary">{role.roleName}</Badge>

              {role.roleDescription && <p className="mt-2 text-sm text-text-muted">{role.roleDescription}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FUNCTIONS */}
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Danh sách chức năng</CardTitle>

              <p className="mt-1 text-sm text-text-muted">
                Đã chọn {checkedIds.size}
                {' / '}
                {functions.length} chức năng
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!selectedRoleId || functions.length === 0}
              onClick={handleSelectAll}
            >
              {functions.length > 0 && checkedIds.size === functions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {functions.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {functions.map((func) => {
                const checked = checkedIds.has(func.functionId);

                return (
                  <label
                    key={func.functionId}
                    className={`
                        flex cursor-pointer
                        items-start gap-3
                        rounded-xl
                        border
                        p-4
                        transition-colors
                        ${checked ? 'border-primary/40 bg-primary/5' : 'border-border-subtle hover:bg-background'}
                      `}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isSaving}
                      onChange={() => toggleFunction(func.functionId)}
                      className="mt-1 size-4 shrink-0 accent-primary"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="neutral" showDot={false}>
                          {func.functionId}
                        </Badge>

                        <p className="font-semibold text-text-main">{func.functionName}</p>
                      </div>

                      {func.functionDescription && (
                        <p className="mt-2 text-sm text-text-muted">{func.functionDescription}</p>
                      )}

                      {func.functionUrl && <p className="mt-1 truncate text-xs text-text-muted">{func.functionUrl}</p>}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-text-muted">Chưa có chức năng nào trong hệ thống.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPermissionsPage;
