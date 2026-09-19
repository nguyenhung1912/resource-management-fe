import { useState, type FormEvent } from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

import { adminAccountService } from '@/services/adminAccountService';

import type { AdminUser, UpdateAdminUserRequest } from '@/features/admin/accounts/types/admin-account.types';

interface EditUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  if (!user) {
    return null;
  }

  return <EditUserModalForm key={user.uid} user={user} onClose={onClose} onSuccess={onSuccess} />;
}

interface EditUserModalFormProps {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

function EditUserModalForm({ user, onClose, onSuccess }: EditUserModalFormProps) {
  const [form, setForm] = useState<UpdateAdminUserRequest>(() => ({
    userCode: user.userCode,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email,
    phone: user.phone ?? '',
    dob: user.dob ? user.dob.slice(0, 10) : null,
    gender: user.gender ?? 0,
    majorId: user.majorId ?? null,
    subMajorCode: user.subMajorCode ?? null,
  }));

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.userCode?.trim() || !form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim()) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc.');

      return;
    }

    try {
      setIsSaving(true);
      setError('');

      await adminAccountService.updateUser(user.uid, {
        ...form,

        userCode: form.userCode.trim(),

        firstName: form.firstName.trim(),

        lastName: form.lastName.trim(),

        email: form.email.trim(),

        phone: form.phone?.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);

      setError('Không thể cập nhật người dùng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-main">Cập nhật người dùng</h2>

            <p className="mt-1 text-sm text-text-muted">
              {user.fullName}
              {' · '}
              {user.userCode}
            </p>
          </div>

          <Button type="button" variant="ghost" size="icon" disabled={isSaving} onClick={onClose} aria-label="Đóng">
            <X className="size-5" />
          </Button>
        </div>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-user-code" requiredBadge>
                  Mã người dùng
                </Label>

                <Input
                  id="edit-user-code"
                  value={form.userCode ?? ''}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      userCode: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-email" requiredBadge>
                  Email
                </Label>

                <Input
                  id="edit-email"
                  type="email"
                  value={form.email ?? ''}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-last-name" requiredBadge>
                  Họ
                </Label>

                <Input
                  id="edit-last-name"
                  value={form.lastName ?? ''}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-first-name" requiredBadge>
                  Tên
                </Label>

                <Input
                  id="edit-first-name"
                  value={form.firstName ?? ''}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Số điện thoại</Label>

                <Input
                  id="edit-phone"
                  type="tel"
                  value={form.phone ?? ''}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-dob">Ngày sinh</Label>

                <Input
                  id="edit-dob"
                  type="date"
                  value={form.dob ?? ''}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dob: event.target.value || null,
                    }))
                  }
                />
              </div>

              <Select
                id="edit-gender"
                label="Giới tính"
                value={String(form.gender ?? 0)}
                disabled={isSaving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    gender: Number(event.target.value),
                  }))
                }
                options={[
                  {
                    value: '0',
                    label: 'Khác',
                  },
                  {
                    value: '1',
                    label: 'Nam',
                  },
                  {
                    value: '2',
                    label: 'Nữ',
                  },
                ]}
              />

              <div className="space-y-1.5">
                <Label>Vai trò</Label>

                <div className="flex h-10 items-center rounded-lg border border-border-subtle bg-gray-50 px-3 text-sm text-text-muted">
                  {user.role ?? 'Chưa có Role'}
                </div>

                <p className="text-xs text-text-muted">Vai trò được thay đổi tại mục Quản lý Role.</p>
              </div>

              <div className="space-y-1.5">
                <Label>Ngành</Label>

                <div className="flex h-10 items-center rounded-lg border border-border-subtle bg-gray-50 px-3 text-sm text-text-muted">
                  {user.major ?? '—'}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Chuyên ngành</Label>

                <div className="flex h-10 items-center rounded-lg border border-border-subtle bg-gray-50 px-3 text-sm text-text-muted">
                  {user.subMajor ?? '—'}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border-subtle pt-5">
              <Button type="button" variant="secondary" disabled={isSaving} onClick={onClose}>
                Hủy
              </Button>

              <Button type="submit" variant="primary" isLoading={isSaving}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditUserModal;
