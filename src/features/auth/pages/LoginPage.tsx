import { Layers3 } from 'lucide-react';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { useLogin } from '@/features/auth/hooks/useLogin';

export function LoginPage() {
  const { error, isLoading, handleLogin, handleGoogleLogin } = useLogin();

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
        <div
          className="
            mx-auto
            mb-4
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            text-primary
          "
        >
          <Layers3 className="h-7 w-7" />
        </div>

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
        <LoginForm error={error} isLoading={isLoading} onSubmit={handleLogin} onGoogleLogin={handleGoogleLogin} />
      </div>
    </section>
  );
}

export default LoginPage;
