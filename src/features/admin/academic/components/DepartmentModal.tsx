import { useState, type FormEvent } from 'react';
import { Building2 } from 'lucide-react';

import { AlertBanner } from '@/components/common/AlertBanner';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import { academicService } from '@/services/academicService';

import type { Department } from '../types/academic.types';

interface DepartmentModalProps {
  isOpen: boolean;
  department?: Department | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DepartmentModal({ isOpen, department, onClose, onSuccess }: DepartmentModalProps) {
  const [departmentName, setDepartmentName] = useState(department?.departmentName ?? '');

  const [nameError, setNameError] = useState<string>();

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(department);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = departmentName.trim();

    if (!name) {
      setNameError('Vui lòng nhập tên khoa.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setNameError(undefined);

      if (department) {
        await academicService.updateDepartment({
          departmentId: department.departmentId,
          departmentName: name,
        });
      } else {
        await academicService.createDepartment({
          departmentName: name,
        });
      }

      onSuccess();
    } catch (err) {
      console.error(err);

      setError(isEditing ? 'Không thể cập nhật khoa.' : 'Không thể thêm khoa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      closeOnEscape={!isSubmitting}
      closeOnBackdropClick={!isSubmitting}
      title={isEditing ? 'Cập nhật khoa' : 'Thêm khoa'}
      description={isEditing ? 'Chỉnh sửa thông tin khoa.' : 'Thêm khoa mới vào hệ thống.'}
      icon={
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </div>
      }
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={onClose}>
            Hủy
          </Button>

          <Button type="submit" form="department-form" isLoading={isSubmitting}>
            {isEditing ? 'Lưu thay đổi' : 'Thêm khoa'}
          </Button>
        </>
      }
    >
      <form id="department-form" onSubmit={handleSubmit} className="space-y-5">
        {error && <AlertBanner type="danger" message={error} />}

        <div className="space-y-2">
          <Label htmlFor="departmentName" requiredBadge error={Boolean(nameError)}>
            Tên khoa
          </Label>

          <Input
            id="departmentName"
            autoFocus
            value={departmentName}
            error={nameError}
            disabled={isSubmitting}
            placeholder="Ví dụ: Khoa Công nghệ thông tin"
            onChange={(event) => {
              setDepartmentName(event.target.value);

              if (nameError) {
                setNameError(undefined);
              }
            }}
          />
        </div>
      </form>
    </BaseModal>
  );
}

export default DepartmentModal;
