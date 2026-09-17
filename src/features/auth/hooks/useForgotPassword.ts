import { useState } from 'react';

import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

type ForgotPasswordStep = 'request' | 'verify' | 'reset';

export function useForgotPassword() {
  const [step, setStep] = useState<ForgotPasswordStep>('request');

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const [userCode, setUserCode] = useState('');

  const [email, setEmail] = useState('');

  const sendOtp = async (inputUserCode: string, inputEmail: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const response = await authService.forgotPassword({
        userCode: inputUserCode.trim(),
        email: inputEmail.trim(),
      });

      setUserCode(inputUserCode.trim());
      setEmail(inputEmail.trim());

      setMessage(response.message);
      setStep('verify');

      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, 'Không thể gửi mã OTP.'));

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const response = await authService.verifyOtp({
        userCode,
        otp: otp.trim(),
      });

      setMessage(response.message);
      setStep('reset');

      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, 'Xác thực OTP thất bại.'));

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (newPassword: string, confirmPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const response = await authService.resetPassword({
        userCode,
        email,
        newPassword,
        confirmPassword,
      });

      setMessage(response.message);

      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, 'Đặt lại mật khẩu thất bại.'));

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    return sendOtp(userCode, email);
  };

  return {
    step,
    userCode,
    email,
    isLoading,
    error,
    message,
    sendOtp,
    verifyOtp,
    resetPassword,
    resendOtp,
  };
}
