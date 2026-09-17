import {
  BadgeCheck,
  Building2,
  CalendarDays,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import type { UserProfile } from '@/features/profile/types/profile.types';

function getGenderValue(gender: string): number {
  if (gender === 'Nam') {
    return 1;
  }

  if (gender === 'Nữ') {
    return 2;
  }

  return 3;
}

function formatDateForInput(value: string | null): string {
  if (!value) {
    return '';
  }

  return value.split('T')[0];
}

export function ProfilePage() {
  const profile = useLoaderData() as UserProfile;

  const revalidator = useRevalidator();

  const { isSaving, error, updateProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);

  const [phone, setPhone] = useState('');

  const [dob, setDob] = useState('');

  const [gender, setGender] = useState(3);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (error && !profile) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const handleStartEditing = () => {
    setPhone(profile.phone ?? '');

    setDob(formatDateForInput(profile.dob));

    setGender(getGenderValue(profile.gender));

    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPhone(profile.phone ?? '');

    setDob(formatDateForInput(profile.dob));

    setGender(getGenderValue(profile.gender));

    setIsEditing(false);
    setSuccessMessage(null);
  };

  const handleUpdate = async () => {
    try {
      setSuccessMessage(null);

      await updateProfile({
        phone: phone.trim(),
        dob: dob || undefined,
        gender,
      });

      setSuccessMessage('Cập nhật hồ sơ thành công.');

      setIsEditing(false);

      revalidator.revalidate();
    } catch {
      // useProfile đã xử lý error
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-main">Hồ sơ cá nhân</h1>

        <p className="mt-1 text-sm text-text-muted">Xem và cập nhật thông tin cá nhân của bạn.</p>
      </div>

      {successMessage ? (
        <div role="status" className="mb-4 rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="mb-4 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
        {/* HEADER */}
        <div className="border-b border-border-subtle px-6 py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-10" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-semibold text-text-main">{profile.fullName}</h2>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />

                  {profile.role}
                </span>

                <span
                  className={
                    profile.isActive
                      ? 'inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success'
                      : 'inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger'
                  }
                >
                  <BadgeCheck className="size-3.5" aria-hidden="true" />

                  {profile.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </div>
            </div>

            {!isEditing ? (
              <Button type="button" variant="primary" onClick={handleStartEditing}>
                <Pencil className="size-4" aria-hidden="true" />
                Cập nhật hồ sơ
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={isSaving} onClick={handleCancel}>
                  <X className="size-4" aria-hidden="true" />
                  Hủy
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  isLoading={isSaving}
                  onClick={() => {
                    void handleUpdate();
                  }}
                >
                  <Save className="size-4" aria-hidden="true" />
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          <h3 className="mb-4 text-base font-semibold text-text-main">Thông tin cá nhân</h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* KHÔNG CHO SỬA TÊN */}
            <ProfileField icon={UserRound} label="Họ và tên" value={profile.fullName} />

            <ProfileField icon={BadgeCheck} label="Mã người dùng" value={profile.userCode} />

            <ProfileField icon={Mail} label="Email" value={profile.email} />

            {/* PHONE */}
            {isEditing ? (
              <EditableField icon={Phone} label="Số điện thoại">
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </EditableField>
            ) : (
              <ProfileField icon={Phone} label="Số điện thoại" value={profile.phone} />
            )}

            {/* DOB */}
            {isEditing ? (
              <EditableField icon={CalendarDays} label="Ngày sinh">
                <input
                  type="date"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </EditableField>
            ) : (
              <ProfileField
                icon={CalendarDays}
                label="Ngày sinh"
                value={profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : null}
              />
            )}

            {/* GENDER */}
            {isEditing ? (
              <EditableField icon={UserRound} label="Giới tính">
                <select
                  value={gender}
                  onChange={(event) => setGender(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value={1}>Nam</option>

                  <option value={2}>Nữ</option>

                  <option value={3}>Khác</option>
                </select>
              </EditableField>
            ) : (
              <ProfileField icon={UserRound} label="Giới tính" value={profile.gender} />
            )}

            {/* READ ONLY */}
            <ProfileField icon={ShieldCheck} label="Vai trò" value={profile.role} />

            <ProfileField icon={Building2} label="Khoa" value={profile.department} />

            <ProfileField icon={GraduationCap} label="Ngành" value={profile.major} />

            <ProfileField icon={GraduationCap} label="Chuyên ngành" value={profile.subMajor} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  icon: typeof UserRound;
  label: string;
  value?: string | null;
}

function ProfileField({ icon: Icon, label, value }: ProfileFieldProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">{label}</p>

          <p className="mt-1 break-words text-sm font-semibold text-text-main">{value || 'Chưa cập nhật'}</p>
        </div>
      </div>
    </div>
  );
}

interface EditableFieldProps {
  icon: typeof UserRound;
  label: string;
  children: React.ReactNode;
}

function EditableField({ icon: Icon, label, children }: EditableFieldProps) {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <label className="text-xs font-medium text-text-muted">{label}</label>

          {children}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
