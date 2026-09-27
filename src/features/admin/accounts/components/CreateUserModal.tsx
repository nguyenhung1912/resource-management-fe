import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { AlertBanner } from '@/components/common/AlertBanner';
import { Select } from '@/components/ui/Select';
import { BaseModal } from '@/components/common/BaseModal';

import { academicService } from '@/services/academicService';
import type { Department, Major, SubMajor } from '@/features/admin/academic/types/academic.types';
import { adminAccountService } from '@/services/adminAccountService';
import type { CreateAdminUserRequest, Role } from '@/features/admin/accounts/types/admin-account.types';

interface CreateUserModalProps {
  roles: Role[];
  departments: Department[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ roles, departments, onClose, onSuccess }: CreateUserModalProps) {
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
  const [departmentId, setDepartmentId] = useState('');

  const [majors, setMajors] = useState<Major[]>([]);

  const [subMajors, setSubMajors] = useState<SubMajor[]>([]);

  const [isAcademicLoading, setIsAcademicLoading] = useState(false);

  const selectedRole = roles.find((role) => role.roleId === form.roleId);

  const roleName = selectedRole?.roleName;

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

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

    if (roleName === 'Lecturer' || roleName === 'Student') {
      if (!departmentId) {
        return 'Vui lòng chọn khoa.';
      }

      if (!form.majorId?.trim()) {
        return 'Vui lòng chọn ngành học.';
      }
    }

    if (roleName === 'Student' && !form.subMajorCode?.trim()) {
      return 'Vui lòng chọn chuyên ngành.';
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

  const handleDepartmentChange = async (selectedDepartmentId: string) => {
    setDepartmentId(selectedDepartmentId);

    setMajors([]);
    setSubMajors([]);

    setForm((current) => ({
      ...current,
      majorId: null,
      subMajorCode: null,
    }));

    setError(null);

    if (!selectedDepartmentId) {
      return;
    }

    try {
      setIsAcademicLoading(true);

      const data = await academicService.getMajors(selectedDepartmentId);

      setMajors(data);
    } catch (err) {
      console.error(err);

      setError('Không thể tải danh sách ngành học.');
    } finally {
      setIsAcademicLoading(false);
    }
  };

  const handleMajorChange = async (selectedMajorId: string) => {
    setForm((current) => ({
      ...current,
      majorId: selectedMajorId || null,
      subMajorCode: null,
    }));

    setSubMajors([]);
    setError(null);

    if (!selectedMajorId || roleName !== 'Student') {
      return;
    }

    try {
      setIsAcademicLoading(true);

      const data = await academicService.getSubMajors(selectedMajorId);

      setSubMajors(data);
    } catch (err) {
      console.error(err);

      setError('Không thể tải danh sách chuyên ngành.');
    } finally {
      setIsAcademicLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen
      title="Tạo người dùng"
      description="Nhập thông tin để tạo tài khoản mới."
      onClose={handleClose}
      maxWidth="2xl"
      fullScreenOnMobile
      closeOnEscape={!isSubmitting}
      closeOnBackdropClick={!isSubmitting}
      showCloseButton={!isSubmitting}
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>

          <Button type="submit" form="create-user-form" isLoading={isSubmitting}>
            Tạo người dùng
          </Button>
        </>
      }
    >
      <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <AlertBanner type="danger" message={error} onClose={() => setError(null)} />}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label requiredBadge>Mã người dùng</Label>

            <Input
              value={form.userCode}
              onChange={(event) => handleChange('userCode', event.target.value)}
              placeholder="VD: SV001"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label requiredBadge>Email</Label>

            <Input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="example@gmail.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label requiredBadge>Họ</Label>

            <Input
              value={form.lastName}
              onChange={(event) => handleChange('lastName', event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label requiredBadge>Tên</Label>

            <Input
              value={form.firstName}
              onChange={(event) => handleChange('firstName', event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label requiredBadge>Mật khẩu</Label>

            <Input
              type="password"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Ngày sinh</Label>

            <Input
              type="date"
              value={form.dob ?? ''}
              onChange={(event) => handleChange('dob', event.target.value || null)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Số điện thoại</Label>

            <Input
              value={form.phone ?? ''}
              onChange={(event) => handleChange('phone', event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label requiredBadge>Giới tính</Label>

            <Select
              value={String(form.gender)}
              disabled={isSubmitting}
              onChange={(event) => handleChange('gender', Number(event.target.value))}
            >
              <option value="0">Khác</option>
              <option value="1">Nam</option>
              <option value="2">Nữ</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label requiredBadge>Role</Label>

            <Select
              value={form.roleId ? String(form.roleId) : ''}
              disabled={isSubmitting}
              onChange={(event) => {
                const roleId = Number(event.target.value);

                setForm((current) => ({
                  ...current,
                  roleId,
                  majorId: null,
                  subMajorCode: null,
                }));

                setDepartmentId('');
                setMajors([]);
                setSubMajors([]);
                setError(null);
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
              <Label requiredBadge>Khoa</Label>

              <Select
                value={departmentId}
                disabled={isSubmitting || isAcademicLoading}
                onChange={(event) => {
                  void handleDepartmentChange(event.target.value);
                }}
              >
                <option value="">-- Chọn khoa --</option>

                {departments.map((department) => (
                  <option key={department.departmentId} value={department.departmentId}>
                    {department.departmentName}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {(roleName === 'Student' || roleName === 'Lecturer') && (
            <div className="space-y-2">
              <Label requiredBadge>Ngành học</Label>

              <Select
                value={form.majorId ?? ''}
                disabled={!departmentId || isSubmitting || isAcademicLoading}
                onChange={(event) => {
                  void handleMajorChange(event.target.value);
                }}
              >
                <option value="">-- Chọn ngành học --</option>

                {majors.map((major) => (
                  <option key={major.majorId} value={major.majorId}>
                    {major.majorName}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {roleName === 'Student' && (
            <div className="space-y-2">
              <Label requiredBadge>Chuyên ngành</Label>

              <Select
                value={form.subMajorCode ?? ''}
                disabled={!form.majorId || isSubmitting || isAcademicLoading}
                onChange={(event) => handleChange('subMajorCode', event.target.value || null)}
              >
                <option value="">-- Chọn chuyên ngành --</option>

                {subMajors.map((subMajor) => (
                  <option key={subMajor.subMajorCode} value={subMajor.subMajorCode}>
                    {subMajor.subMajorName}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            disabled={isSubmitting}
            onChange={(event) => handleChange('isActive', event.target.checked)}
          />

          <span className="text-sm">Kích hoạt tài khoản ngay sau khi tạo</span>
        </label>
      </form>
    </BaseModal>
  );
}

export default CreateUserModal;
