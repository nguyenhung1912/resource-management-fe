import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { AlertBanner } from '@/components/common/AlertBanner';
import { Select } from '@/components/ui/Select';

import { adminAccountService } from '@/services/adminAccountService';

import type { CreateAdminUserRequest, Role } from '@/features/admin/accounts/types/admin-account.types';

interface CreateUserModalProps {
  roles: Role[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ roles, onClose, onSuccess }: CreateUserModalProps) {
  const [form, setForm] = useState<CreateAdminUserRequest>({
    userCode: '',
    firstName: '',
    lastName: '',
    password: '',
    dob: null,
    email: '',
    phone: '',
    gender: 0,
    roleId: 0,
    majorId: null,
    subMajorCode: null,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = roles.find((role) => role.roleId === form.roleId);

  const roleName = selectedRole?.roleName;

  const handleChange = <K extends keyof CreateAdminUserRequest>(field: K, value: CreateAdminUserRequest[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!form.userCode.trim()) {
      return 'Vui lòng nhập mã người dùng.';
    }

    if (!form.firstName.trim()) {
      return 'Vui lòng nhập tên.';
    }

    if (!form.lastName.trim()) {
      return 'Vui lòng nhập họ.';
    }

    if (!form.email.trim()) {
      return 'Vui lòng nhập email.';
    }

    if (!form.password.trim()) {
      return 'Vui lòng nhập mật khẩu.';
    }

    if (!form.roleId) {
      return 'Vui lòng chọn Role.';
    }

    if (roleName === 'Lecturer' && !form.majorId?.trim()) {
      return 'Giảng viên phải có chuyên ngành.';
    }

    if (roleName === 'Student') {
      if (!form.majorId?.trim()) {
        return 'Sinh viên phải có chuyên ngành.';
      }

      if (!form.subMajorCode?.trim()) {
        return 'Sinh viên phải có chuyên ngành con.';
      }
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await adminAccountService.createUser({
        ...form,
        majorId: form.majorId?.trim() || null,
        subMajorCode: form.subMajorCode?.trim() || null,
        phone: form.phone?.trim() || null,
        dob: form.dob || null,
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Không thể tạo người dùng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardHeader>
          <CardTitle>Tạo người dùng</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <AlertBanner type="danger" message={error} onClose={() => setError(null)} />}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label requiredBadge>Mã người dùng</Label>
                <Input
                  value={form.userCode}
                  onChange={(event) => handleChange('userCode', event.target.value)}
                  placeholder="VD: SV001"
                />
              </div>

              <div className="space-y-2">
                <Label requiredBadge>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label requiredBadge>Họ</Label>
                <Input value={form.lastName} onChange={(event) => handleChange('lastName', event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label requiredBadge>Tên</Label>
                <Input value={form.firstName} onChange={(event) => handleChange('firstName', event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label requiredBadge>Mật khẩu</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Input
                  type="date"
                  value={form.dob ?? ''}
                  onChange={(event) => handleChange('dob', event.target.value || null)}
                />
              </div>

              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={form.phone ?? ''} onChange={(event) => handleChange('phone', event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label requiredBadge>Giới tính</Label>
                <Select
                  value={String(form.gender)}
                  onChange={(event) => handleChange('gender', Number(event.target.value))}
                >
                  <option value="0">Nam</option>
                  <option value="1">Nữ</option>
                  <option value="2">Khác</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label requiredBadge>Role</Label>
                <Select
                  value={form.roleId ? String(form.roleId) : ''}
                  onChange={(event) => {
                    const roleId = Number(event.target.value);

                    setForm((current) => ({
                      ...current,
                      roleId,
                      majorId: null,
                      subMajorCode: null,
                    }));
                  }}
                >
                  <option value="">-- Chọn Role --</option>

                  {roles.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </Select>
              </div>

              {(roleName === 'Student' || roleName === 'Lecturer') && (
                <div className="space-y-2">
                  <Label requiredBadge>Chuyên ngành</Label>

                  <Input
                    value={form.majorId ?? ''}
                    onChange={(event) => handleChange('majorId', event.target.value)}
                    placeholder="Nhập mã chuyên ngành"
                  />
                </div>
              )}

              {roleName === 'Student' && (
                <div className="space-y-2">
                  <Label requiredBadge>Chuyên ngành con</Label>

                  <Input
                    value={form.subMajorCode ?? ''}
                    onChange={(event) => handleChange('subMajorCode', event.target.value)}
                    placeholder="Nhập mã chuyên ngành con"
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => handleChange('isActive', event.target.checked)}
              />

              <span className="text-sm">Kích hoạt tài khoản ngay sau khi tạo</span>
            </label>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>

              <Button type="submit" isLoading={isSubmitting}>
                Tạo người dùng
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateUserModal;
