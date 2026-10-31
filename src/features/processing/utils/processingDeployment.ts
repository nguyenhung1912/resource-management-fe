/** Deployment configuration, not a claim about live backend readiness. */
export function processingDeployment() {
  return {
    enabled: import.meta.env.VITE_AUTOMATIC_PROCESSING_ENABLED === 'true',
    legacyManualDecisions: import.meta.env.VITE_LEGACY_MANUAL_MODERATION_ENABLED === 'true',
  };
}

export const processingPausedMessage =
  'Xử lý tự động đang tạm dừng trên môi trường này. Yêu cầu đã tiếp nhận có thể tiếp tục chờ; chưa có kết quả kiểm tra mới.';
