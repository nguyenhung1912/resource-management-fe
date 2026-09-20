import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';

interface LoginFormProps {
  isLoading: boolean;
  error: string | null;

  onSubmit(userCode: string, password: string): Promise<void>;

  onGoogleLogin(): void;
}

export function LoginForm({ isLoading, error, onSubmit, onGoogleLogin }: LoginFormProps) {
  const [userCode, setUserCode] = useState('');

  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userCode.trim() || !password) {
      return;
    }

    await onSubmit(userCode.trim(), password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Button type="button" variant="outline" onClick={onGoogleLogin} className="w-full">
        <FcGoogle className="h-5 w-5" />
        Đăng nhập với Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />

        <span className="text-xs text-text-muted">hoặc đăng nhập bằng tài khoản</span>

        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      {error && (
        <div
          role="alert"
          className="
            rounded-lg
            border border-danger/20
            bg-danger/5
            px-4
            py-3
            text-sm
            text-danger
          "
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="userCode" requiredBadge>
          Mã sinh viên
        </Label>

        <Input
          id="userCode"
          inputSize="lg"
          value={userCode}
          disabled={isLoading}
          autoComplete="username"
          placeholder="Nhập mã sinh viên..."
          onChange={(event) => setUserCode(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" requiredBadge>
          Mật khẩu
        </Label>

        <Input
          id="password"
          type="password"
          inputSize="lg"
          value={password}
          disabled={isLoading}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu..."
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Link to={APP_PATHS.FORGOT_PASSWORD} className="text-sm font-medium text-primary hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={!userCode.trim() || !password}
        className="w-full"
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>

      <div className="pt-2 text-center">
        <Link
          to={APP_PATHS.HOME}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md py-1 px-2"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>
    </form>
  );
}
