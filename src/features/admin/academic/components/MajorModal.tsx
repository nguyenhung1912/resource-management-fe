import { useState, type FormEvent } from 'react';
import { GraduationCap } from 'lucide-react';

import { AlertBanner } from '@/components/common/AlertBanner';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

import { academicService } from '@/services/academicService';

import type { Department, Major } from '../types/academic.types';

interface MajorModalProps {
  isOpen: boolean;
  departments: Department[];
  major?: Major | null;
  defaultDepartmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MajorModal({
  isOpen,
  departments,
  major,
  defaultDepartmentId = '',
  onClose,
  onSuccess,
}: MajorModalProps) {
  const [majorName, setMajorName] = useState(major?.majorName ?? '');

  const [departmentId, setDepartmentId] = useState(major?.departmentId ?? defaultDepartmentId);

  const [majorNameError, setMajorNameError] = useState<string>();

  const [departmentError, setDepartmentError] = useState<string>();

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(major);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = majorName.trim();

    let hasError = false;

    if (!departmentId) {
      setDepartmentError('Vui lòng chọn khoa.');
      hasError = true;
    }

    if (!name) {
      setMajorNameError('Vui lòng nhập tên ngành học.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (major) {
        await academicService.updateMajor({
          majorId: major.majorId,
          majorName: name,
          departmentId,
        });
      } else {
        await academicService.createMajor({
          majorName: name,
          departmentId,
        });
      }

      onSuccess();
    } catch (err) {
      console.error(err);

      setError(isEditing ? 'Không thể cập nhật ngành học.' : 'Không thể thêm ngành học.');
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
      title={isEditing ? 'Cập nhật ngành học' : 'Thêm ngành học'}
      description={isEditing ? 'Chỉnh sửa thông tin ngành học.' : 'Thêm ngành học mới vào khoa.'}
      icon={
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="size-5" />
        </div>
      }
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={onClose}>
            Hủy
          </Button>

          <Button type="submit" form="major-form" isLoading={isSubmitting}>
            {isEditing ? 'Lưu thay đổi' : 'Thêm ngành'}
          </Button>
        </>
      }
    >
      <form id="major-form" onSubmit={handleSubmit} className="space-y-5">
        {error && <AlertBanner type="danger" message={error} />}

        <div className="space-y-2">
          <Label htmlFor="majorDepartment" requiredBadge error={Boolean(departmentError)}>
            Khoa
          </Label>

          <Select
            id="majorDepartment"
            value={departmentId}
            disabled={isSubmitting}
            error={departmentError}
            onChange={(event) => {
              setDepartmentId(event.target.value);
              setDepartmentError(undefined);
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

        <div className="space-y-2">
          <Label htmlFor="majorName" requiredBadge error={Boolean(majorNameError)}>
            Tên ngành học
          </Label>

          <Input
            id="majorName"
            autoFocus
            value={majorName}
            disabled={isSubmitting}
            error={majorNameError}
            placeholder="Ví dụ: Công nghệ thông tin"
            onChange={(event) => {
              setMajorName(event.target.value);
              setMajorNameError(undefined);
            }}
          />
        </div>
      </form>
    </BaseModal>
  );
}

export default MajorModal;
