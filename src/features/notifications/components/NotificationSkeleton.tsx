interface NotificationSkeletonProps {
  count?: number;
}

export function NotificationSkeleton({ count = 6 }: NotificationSkeletonProps) {
  return (
    <div className="divide-y divide-border-subtle" role="status" aria-label="Đang tải thông báo">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 p-3.5 animate-pulse">
          {/* Avatar Icon placeholder */}
          <div className="h-9 w-9 rounded-lg bg-gray-200 shrink-0" />

          {/* Content lines placeholder */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-5/6 rounded bg-gray-100" />
            <div className="h-2.5 w-1/4 rounded bg-gray-100 pt-1" />
          </div>
        </div>
      ))}
      <span className="sr-only">Đang tải danh sách thông báo...</span>
    </div>
  );
}

export default NotificationSkeleton;
