import { Outlet } from 'react-router-dom';
import { Header } from './ui/Header';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-text-main">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-border-subtle bg-surface text-center text-xs text-text-muted">
        <p>© 2026 Resource Management System.</p>
      </footer>
    </div>
  );
}

export default MainLayout;
