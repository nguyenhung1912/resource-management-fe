import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="min-h-full bg-background">
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
