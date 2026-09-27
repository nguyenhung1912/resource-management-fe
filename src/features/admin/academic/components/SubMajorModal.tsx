import { useState, type FormEvent } from 'react';
import { Network } from 'lucide-react';

import { AlertBanner } from '@/components/common/AlertBanner';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

import { academicService } from '@/services/academicService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

import type { Major, SubMajor } from '../types/academic.types';

interface SubMajorModalProps {
  isOpen: boolean;
  majors: Major[];
  subMajor?: SubMajor | null;
  defaultMajorId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubMajorModal({
  isOpen,
  majors,
  subMajor,
  defaultMajorId = '',
  onClose,
  onSuccess,
}: SubMajorModalProps) {
  const [subMajorName, setSubMajorName] = useState(subMajor?.subMajorName ?? '');

  const [majorId, setMajorId] = useState(subMajor?.majorId ?? defaultMajorId);

  const [nameError, setNameError] = useState<string>();

  const [majorError, setMajorError] = useState<string>();

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(subMajor);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = subMajorName.trim();

    let hasError = false;

    if (!majorId) {
      setMajorError('Vui lòng chọn ngành học.');
      hasError = true;
    }

    if (!name) {
      setNameError('Vui lòng nhập tên chuyên ngành.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (subMajor) {
        await academicService.updateSubMajor({
          subMajorCode: subMajor.subMajorCode,
          subMajorName: name,
          majorId,
        });
      } else {
        await academicService.createSubMajor({
          subMajorName: name,
          majorId,
        });
      }

      onSuccess();
    } catch (submitError) {
      setError(
        getApiErrorMessage(
          submitError,
          isEditing ? 'Không thể cập nhật chuyên ngành.' : 'Không thể thêm chuyên ngành.',
        ),
      );
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
      title={isEditing ? 'Cập nhật chuyên ngành' : 'Thêm chuyên ngành'}
      description={isEditing ? 'Chỉnh sửa thông tin chuyên ngành.' : 'Thêm chuyên ngành mới vào ngành học.'}
      icon={
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Network className="size-5" />
        </div>
      }
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={onClose}>
            Hủy
          </Button>

          <Button type="submit" form="sub-major-form" isLoading={isSubmitting}>
            {isEditing ? 'Lưu thay đổi' : 'Thêm chuyên ngành'}
          </Button>
        </>
      }
    >
      <form id="sub-major-form" onSubmit={handleSubmit} className="space-y-5">
        {error && <AlertBanner type="danger" message={error} />}

        <div className="space-y-2">
          <Label htmlFor="subMajorMajor" requiredBadge error={Boolean(majorError)}>
            Ngành học
          </Label>

          <Select
            id="subMajorMajor"
            value={majorId}
            disabled={isSubmitting}
            error={majorError}
            onChange={(event) => {
              setMajorId(event.target.value);
              setMajorError(undefined);
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

        <div className="space-y-2">
          <Label htmlFor="subMajorName" requiredBadge error={Boolean(nameError)}>
            Tên chuyên ngành
          </Label>

          <Input
            id="subMajorName"
            autoFocus
            value={subMajorName}
            disabled={isSubmitting}
            error={nameError}
            placeholder="Ví dụ: Kỹ thuật phần mềm"
            onChange={(event) => {
              setSubMajorName(event.target.value);

              setNameError(undefined);
            }}
          />
        </div>
      </form>
    </BaseModal>
  );
}

export default SubMajorModal;
