import { Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_PATHS } from '@/constants/path';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';

export function ChangePasswordPage() {
  const navigate = useNavigate();

  const { isLoading, error, success, changePassword } = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setClientError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setClientError('Vui lòng nhập đầy đủ thông tin.');

      return;
    }

    if (newPassword !== confirmPassword) {
      setClientError('Mật khẩu xác nhận không khớp.');

      return;
    }

    if (newPassword === currentPassword) {
      setClientError('Mật khẩu mới phải khác mật khẩu hiện tại.');

      return;
    }

    const changed = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (changed) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-main">Đổi mật khẩu</h1>

        <p className="mt-1 text-sm text-text-muted">Thay đổi mật khẩu đăng nhập của tài khoản.</p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface shadow-sm">
        <div className="border-b border-border-subtle p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="size-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="font-semibold text-text-main">Bảo mật tài khoản</h2>

              <p className="text-sm text-text-muted">Nhập mật khẩu hiện tại trước khi đặt mật khẩu mới.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {clientError || error ? (
            <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {clientError || error}
            </div>
          ) : null}

          {success ? (
            <div role="status" className="rounded-xl border border-success/20 bg-success/5 p-3 text-sm text-success">
              {success}
            </div>
          ) : null}

          <PasswordField
            label="Mật khẩu hiện tại"
            value={currentPassword}
            showPassword={showCurrentPassword}
            disabled={isLoading}
            onChange={setCurrentPassword}
            onToggle={() => setShowCurrentPassword((value) => !value)}
          />

          <PasswordField
            label="Mật khẩu mới"
            value={newPassword}
            showPassword={showNewPassword}
            disabled={isLoading}
            onChange={setNewPassword}
            onToggle={() => setShowNewPassword((value) => !value)}
          />

          <PasswordField
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            showPassword={showConfirmPassword}
            disabled={isLoading}
            onChange={setConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => navigate(APP_PATHS.PROFILE)}>
              Quay lại
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              <LockKeyhole className="size-4" aria-hidden="true" />

              {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  showPassword: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}

function PasswordField({ label, value, showPassword, disabled, onChange, onToggle }: PasswordFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-main">{label}</label>

      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          className="pr-11"
        />

        <button
          type="button"
          aria-label={showPassword ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          disabled={disabled}
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-main"
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
