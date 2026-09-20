import { Link, useSearchParams } from 'react-router-dom';

import logoQnu from '@/assets/logo-qnu.webp';
import { APP_PATHS } from '@/constants/path';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useLogin } from '@/features/auth/hooks/useLogin';

export function LoginPage() {
  const { error, isLoading, handleLogin, handleGoogleLogin } = useLogin();

  const [searchParams] = useSearchParams();

  const googleErrorCode = searchParams.get('error');

  const googleErrorMessages: Record<string, string> = {
    google_login_failed: 'Đăng nhập Google thất bại.',

    google_email_missing: 'Không lấy được email từ Google.',

    google_account_not_found: 'Email Google chưa được đăng ký trong hệ thống.',

    google_account_locked: 'Tài khoản đã bị khóa.',

    google_callback_invalid: 'Thông tin đăng nhập Google không hợp lệ.',
  };

  const googleError = googleErrorCode ? googleErrorMessages[googleErrorCode] : null;

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border-subtle
        bg-surface
        shadow-sm
      "
    >
      {/* Header */}
      <div
        className="
          border-b
          border-border-subtle
          px-8
          pb-6
          pt-8
          text-center
        "
      >
        <Link
          to={APP_PATHS.HOME}
          aria-label="Về trang chủ"
          className="
            mx-auto
            mb-4
            inline-block
            rounded-full
            outline-none
            transition-transform
            hover:scale-105
            focus-visible:ring-2
            focus-visible:ring-primary/40
          "
        >
          <img
            src={logoQnu}
            alt="Logo Trường Đại học Quy Nhơn"
            className="size-20 rounded-full border-2 border-border/80 bg-surface object-contain p-1.5 shadow-2xs"
          />
        </Link>

        <h1
          className="
            text-2xl
            font-bold
            tracking-tight
            text-text-main
          "
        >
          Đăng nhập
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-text-muted
          "
        >
          Truy cập hệ thống quản lý tài nguyên
        </p>
      </div>

      {/* Login form */}
      <div className="px-8 py-7">
        <LoginForm
          error={googleError ?? error}
          isLoading={isLoading}
          onSubmit={handleLogin}
          onGoogleLogin={handleGoogleLogin}
        />
      </div>
    </section>
  );
}

export default LoginPage;
