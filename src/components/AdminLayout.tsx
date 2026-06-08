import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // PR 2: real session/role check, not a forgeable sessionStorage flag.
  // The employee id is re-verified against the DB (active + admin-tier role)
  // before any admin UI renders. NOTE: this is a UI/session gate only —
  // server-side RLS enforcement of the admin role is audited and hardened in
  // PR 3, and this gate is NOT a substitute for it.
  const { employee, loading, signOut } = useAdminAuth();

  // Never flash the admin UI before the check resolves.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verifying access…</p>
      </div>
    );
  }

  // No session or insufficient role → redirect to login, not a blank screen.
  if (!employee) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar employeeName={employee.full_name} onSignOut={signOut} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-background px-4 gap-4">
            <SidebarTrigger />
            <h2 className="font-heading text-sm font-semibold text-foreground">Admin Dashboard</h2>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
