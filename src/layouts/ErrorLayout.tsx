import { Outlet } from 'react-router-dom';

export function ErrorLayout() {
  return (
    <div className="min-h-screen bg-background text-text-main">
      <main aria-label="Nội dung lỗi" className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default ErrorLayout;
