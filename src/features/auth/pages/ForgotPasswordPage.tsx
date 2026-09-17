import { ArrowLeft, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { type FormEvent, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_PATHS } from '@/constants/path';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const { step, email, isLoading, error, message, sendOtp, verifyOtp, resetPassword, resendOtp } = useForgotPassword();

  const [userCode, setUserCode] = useState('');

  const [inputEmail, setInputEmail] = useState('');

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const [timeLeft, setTimeLeft] = useState(300);

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [clientError, setClientError] = useState<string | null>(null);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const otp = otpDigits.join('');

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  useEffect(() => {
    if (step !== 'verify' || timeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [step, timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);

    setOtpDigits((current) => {
      const next = [...current];

      next[index] = digit;

      return next;
    });

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (!pasted) {
      return;
    }

    const digits = Array.from({ length: 6 }, (_, index) => pasted[index] ?? '');

    setOtpDigits(digits);

    otpRefs.current[Math.min(pasted.length, 6) - 1]?.focus();
  };

  const handleRequestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setClientError(null);

    if (!userCode.trim() || !inputEmail.trim()) {
      setClientError('Vui lòng nhập mã đăng nhập và email.');

      return;
    }

    const success = await sendOtp(userCode, inputEmail);

    if (success) {
      setOtpDigits(['', '', '', '', '', '']);

      setTimeLeft(300);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);

    if (timeLeft <= 0) {
      setClientError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');

      return;
    }

    if (!otp.trim()) {
      setClientError('Vui lòng nhập mã OTP.');

      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setClientError('Mã OTP phải gồm 6 chữ số.');

      return;
    }

    await verifyOtp(otp);
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);

    if (!newPassword || !confirmPassword) {
      setClientError('Vui lòng nhập đầy đủ mật khẩu.');

      return;
    }

    if (newPassword !== confirmPassword) {
      setClientError('Mật khẩu xác nhận không khớp.');

      return;
    }

    const success = await resetPassword(newPassword, confirmPassword);

    if (success) {
      navigate(APP_PATHS.LOGIN, {
        replace: true,
      });
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4 py-8">
      <div className="w-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-6" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-semibold text-text-main">Quên mật khẩu</h1>

          <p className="mt-2 text-sm text-text-muted">
            {step === 'request' && 'Nhập thông tin tài khoản để nhận mã OTP.'}

            {step === 'verify' && 'Nhập mã OTP được gửi tới email của bạn.'}

            {step === 'reset' && 'Tạo mật khẩu mới cho tài khoản.'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          <Step number={1} active={step === 'request'} completed={step !== 'request'} />

          <div className="h-px flex-1 bg-border-subtle" />

          <Step number={2} active={step === 'verify'} completed={step === 'reset'} />

          <div className="h-px flex-1 bg-border-subtle" />

          <Step number={3} active={step === 'reset'} completed={false} />
        </div>

        {clientError || error ? (
          <div role="alert" className="mb-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
            {clientError || error}
          </div>
        ) : null}

        {message ? (
          <div role="status" className="mb-4 rounded-xl border border-success/20 bg-success/5 p-3 text-sm text-success">
            {message}
          </div>
        ) : null}

        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-main">Mã đăng nhập</label>

              <Input
                value={userCode}
                disabled={isLoading}
                placeholder="Nhập mã sinh viên / mã người dùng"
                onChange={(event) => setUserCode(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-main">Email</label>

              <Input
                type="email"
                value={inputEmail}
                disabled={isLoading}
                placeholder="Nhập email tài khoản"
                onChange={(event) => setInputEmail(event.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!userCode.trim() || !inputEmail.trim()}
              className="w-full"
            >
              <Mail className="size-4" />

              {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center text-sm text-text-muted">
              Mã OTP đã được gửi tới
              <span className="ml-1 font-medium text-text-main">{email}</span>
            </div>

            <div>
              <label className="mb-3 block text-center text-sm font-medium text-text-main">Nhập mã OTP</label>

              <div className="flex justify-center gap-2 sm:gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    disabled={isLoading || timeLeft === 0}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={handleOtpPaste}
                    className="h-12 w-11 rounded-xl border border-border-subtle bg-background text-center text-lg font-semibold text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-12"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-text-muted">
                  Mã OTP hết hạn sau
                  <span className="ml-1 font-semibold text-primary">{formattedTime}</span>
                </p>
              ) : (
                <p className="text-sm font-medium text-danger">Mã OTP đã hết hạn.</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={otp.length !== 6 || timeLeft === 0}
              className="w-full"
            >
              <ShieldCheck className="size-4" />
              Xác thực OTP
            </Button>

            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                const success = await resendOtp();

                if (success) {
                  setOtpDigits(['', '', '', '', '', '']);

                  setTimeLeft(300);

                  window.setTimeout(() => {
                    otpRefs.current[0]?.focus();
                  }, 0);
                }
              }}
              className="w-full text-center text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Gửi lại mã OTP
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!newPassword || !confirmPassword}
              className="w-full"
            >
              <KeyRound className="size-4" />
              Đặt lại mật khẩu
            </Button>
          </form>
        )}

        <div className="mt-6 border-t border-border-subtle pt-4 text-center">
          <Link
            to={APP_PATHS.LOGIN}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StepProps {
  number: number;
  active: boolean;
  completed: boolean;
}

function Step({ number, active, completed }: StepProps) {
  return (
    <div
      className={[
        'flex size-8 items-center justify-center rounded-full text-xs font-semibold',
        active || completed ? 'bg-primary text-white' : 'bg-background text-text-muted',
      ].join(' ')}
    >
      {number}
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
          onChange={(event) => onChange(event.target.value)}
          className="pr-11"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
